// Hybrid solution: Azure frontend + Vercel API (for PLAYipp compatibility)
const API_BASE_URL = import.meta.env.PROD ? 'https://scantovitec.vercel.app/api' : 'http://localhost:5000/api';

class ApiService {
  async fetchWithErrorHandling(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Build query string from filters
  buildQueryString(filters) {
    const params = new URLSearchParams();
    if (filters.month) params.append('month', filters.month);
    if (filters.year) params.append('year', filters.year);
    if (filters.quarter) params.append('quarter', filters.quarter);
    if (filters.week) params.append('week', filters.week);
    if (filters.lastDays) params.append('lastDays', filters.lastDays);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.city) params.append('city', filters.city);
    if (filters.volumeLevel) params.append('volumeLevel', filters.volumeLevel);
    if (filters.customerActivity) params.append('customerActivity', filters.customerActivity);
    return params.toString() ? `?${params.toString()}` : '';
  }

  // Get dashboard statistics cards data
  async getStatistics(filters = {}) {
    const queryString = this.buildQueryString(filters);
    return this.fetchWithErrorHandling(`${API_BASE_URL}/dashboard/statistics${queryString}`);
  }

  // Get scanning activity chart data
  async getScanningActivity(filters = {}) {
    const queryString = this.buildQueryString(filters);
    return this.fetchWithErrorHandling(`${API_BASE_URL}/dashboard/scanning-activity${queryString}`);
  }

  // Get customers by city table data
  async getCustomersByCity(filters = {}) {
    const queryString = this.buildQueryString(filters);
    return this.fetchWithErrorHandling(`${API_BASE_URL}/dashboard/customers-by-city${queryString}`);
  }

  // Get customer activity distribution
  async getCustomerActivity(filters = {}) {
    const queryString = this.buildQueryString(filters);
    return this.fetchWithErrorHandling(`${API_BASE_URL}/dashboard/customer-activity${queryString}`);
  }

  // Get scanning efficiency metrics
  async getScanningEfficiency(filters = {}) {
    const queryString = this.buildQueryString(filters);
    return this.fetchWithErrorHandling(`${API_BASE_URL}/dashboard/scanning-efficiency${queryString}`);
  }
}

export default new ApiService();