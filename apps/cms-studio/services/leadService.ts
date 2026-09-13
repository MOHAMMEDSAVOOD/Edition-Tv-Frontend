export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'DISQUALIFIED' | 'CONVERTED';

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  status: LeadStatus;
  createdAt: string;
  assignedTo?: string;
}

export interface FetchLeadsParams {
  page?: number;
  limit?: number;
  status?: LeadStatus;
  query?: string;
}

export interface FetchLeadsResponse {
  data: Lead[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Generate some mock data
const mockLeads: Lead[] = Array.from({ length: 45 }).map((_, i) => ({
  id: `lead_${i + 1}`,
  name: `Test Lead ${i + 1}`,
  email: `lead${i + 1}@example.com`,
  company: `Company ${Math.floor(i / 3) + 1}`,
  status: ['NEW', 'CONTACTED', 'QUALIFIED', 'DISQUALIFIED', 'CONVERTED'][i % 5] as LeadStatus,
  createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  assignedTo: i % 4 === 0 ? `editor_${(i % 3) + 1}` : undefined,
}));

export const leadService = {
  async fetchLeads(params: FetchLeadsParams = {}): Promise<FetchLeadsResponse> {
    const { page = 1, limit = 10, status, query } = params;

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    let filtered = [...mockLeads];

    if (status) {
      filtered = filtered.filter((l) => l.status === status);
    }

    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.name.toLowerCase().includes(lowerQuery) ||
          l.email.toLowerCase().includes(lowerQuery) ||
          l.company.toLowerCase().includes(lowerQuery)
      );
    }

    // Sort by newest first
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedData = filtered.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      total,
      page,
      limit,
      totalPages,
    };
  }
};
