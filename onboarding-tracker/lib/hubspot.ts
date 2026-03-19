const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;
const BASE_URL = "https://api.hubapi.com";

export interface Contact {
  id: string;
  properties: {
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    lifecyclestage?: string;
    onboarding_cs?: string;
    createdate?: string;
    lastmodifieddate?: string;
    hs_lead_status?: string;
  };
  displayName: string;
  url: string;
}

interface HubSpotFilter {
  propertyName: string;
  operator: string;
  value?: string;
}

interface HubSpotFilterGroup {
  filters: HubSpotFilter[];
}

interface HubSpotSearchResponse {
  total: number;
  results: Array<{
    id: string;
    properties: Contact["properties"];
  }>;
  paging?: { next?: { after: string } };
}

async function hubspotFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${HUBSPOT_API_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`HubSpot API error ${res.status}: ${error}`);
  }

  return res.json();
}

export async function getContactsPendingOnboarding(
  limit = 100,
  after?: string
): Promise<{ contacts: Contact[]; total: number; nextAfter?: string }> {
  const filterGroups: HubSpotFilterGroup[] = [
    {
      filters: [
        { propertyName: "lifecyclestage", operator: "EQ", value: "customer" },
        { propertyName: "onboarding_cs", operator: "EQ", value: "false" },
      ],
    },
    {
      filters: [
        { propertyName: "lifecyclestage", operator: "EQ", value: "customer" },
        { propertyName: "onboarding_cs", operator: "NOT_HAS_PROPERTY" },
      ],
    },
  ];

  const body: Record<string, unknown> = {
    filterGroups,
    properties: [
      "firstname",
      "lastname",
      "email",
      "phone",
      "lifecyclestage",
      "onboarding_cs",
      "createdate",
      "lastmodifieddate",
      "hs_lead_status",
    ],
    sorts: [{ propertyName: "createdate", direction: "DESCENDING" }],
    limit,
  };

  if (after) body.after = after;

  const data: HubSpotSearchResponse = await hubspotFetch(
    "/crm/v3/objects/contacts/search",
    { method: "POST", body: JSON.stringify(body) }
  );

  const contacts: Contact[] = data.results.map((r) => ({
    id: r.id,
    properties: r.properties,
    displayName:
      [r.properties.firstname, r.properties.lastname]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      r.properties.email ||
      r.id,
    url: `https://app.hubspot.com/contacts/50803449/record/0-1/${r.id}`,
  }));

  return {
    contacts,
    total: data.total,
    nextAfter: data.paging?.next?.after,
  };
}

export async function markOnboardingComplete(contactId: string): Promise<void> {
  await hubspotFetch(`/crm/v3/objects/contacts/${contactId}`, {
    method: "PATCH",
    body: JSON.stringify({ properties: { onboarding_cs: "true" } }),
  });
}

export async function getOnboardingStats(): Promise<{
  totalCustomers: number;
  pendingOnboarding: number;
  completedOnboarding: number;
  newThisWeek: number;
}> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [totalRes, pendingRes, completedRes, newThisWeekRes] =
    await Promise.all([
      hubspotFetch("/crm/v3/objects/contacts/search", {
        method: "POST",
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                {
                  propertyName: "lifecyclestage",
                  operator: "EQ",
                  value: "customer",
                },
              ],
            },
          ],
          limit: 1,
        }),
      }),
      hubspotFetch("/crm/v3/objects/contacts/search", {
        method: "POST",
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                {
                  propertyName: "lifecyclestage",
                  operator: "EQ",
                  value: "customer",
                },
                {
                  propertyName: "onboarding_cs",
                  operator: "EQ",
                  value: "false",
                },
              ],
            },
            {
              filters: [
                {
                  propertyName: "lifecyclestage",
                  operator: "EQ",
                  value: "customer",
                },
                {
                  propertyName: "onboarding_cs",
                  operator: "NOT_HAS_PROPERTY",
                },
              ],
            },
          ],
          limit: 1,
        }),
      }),
      hubspotFetch("/crm/v3/objects/contacts/search", {
        method: "POST",
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                {
                  propertyName: "lifecyclestage",
                  operator: "EQ",
                  value: "customer",
                },
                {
                  propertyName: "onboarding_cs",
                  operator: "EQ",
                  value: "true",
                },
              ],
            },
          ],
          limit: 1,
        }),
      }),
      hubspotFetch("/crm/v3/objects/contacts/search", {
        method: "POST",
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                {
                  propertyName: "lifecyclestage",
                  operator: "EQ",
                  value: "customer",
                },
                {
                  propertyName: "createdate",
                  operator: "GTE",
                  value: oneWeekAgo.getTime().toString(),
                },
              ],
            },
          ],
          limit: 1,
        }),
      }),
    ]);

  return {
    totalCustomers: totalRes.total,
    pendingOnboarding: pendingRes.total,
    completedOnboarding: completedRes.total,
    newThisWeek: newThisWeekRes.total,
  };
}
