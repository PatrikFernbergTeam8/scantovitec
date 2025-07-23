const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

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
    return this.fetchWithErrorHandling(`${API_BASE_URL}/statistics${queryString}`);
  }

  // Get scanning activity chart data
  async getScanningActivity(filters = {}) {
    const queryString = this.buildQueryString(filters);
    return this.fetchWithErrorHandling(`${API_BASE_URL}/scanning-activity${queryString}`);
  }

  // Get scanning activity with rolling 12-month period
  async getScanningActivityRolling12Months(filters = {}) {
    // Calculate 12 months ago from current date
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11
    const currentYear = now.getFullYear();
    
    // Calculate start date (12 months ago)
    let startMonth = currentMonth + 1; // Next month from 12 months ago
    let startYear = currentYear - 1;
    
    if (startMonth > 12) {
      startMonth = 1;
      startYear++;
    }
    
    // Calculate end date (current month)
    const endMonth = currentMonth;
    const endYear = currentYear;
    
    // Override date filters to force 12-month rolling window
    const rollingFilters = {
      ...filters,
      dateFrom: `${startYear}-${String(startMonth).padStart(2, '0')}-01`,
      dateTo: `${endYear}-${String(endMonth).padStart(2, '0')}-${new Date(endYear, endMonth, 0).getDate()}`,
      // Remove conflicting date filters
      month: undefined,
      year: undefined,
      quarter: undefined,
      week: undefined,
      lastDays: undefined
    };
    
    const queryString = this.buildQueryString(rollingFilters);
    return this.fetchWithErrorHandling(`${API_BASE_URL}/scanning-activity${queryString}`);
  }

  // Get customers by city table data
  async getCustomersByCity(filters = {}) {
    const queryString = this.buildQueryString(filters);
    return this.fetchWithErrorHandling(`${API_BASE_URL}/customers-by-city${queryString}`);
  }

  // Get customer activity distribution
  async getCustomerActivity(filters = {}) {
    const queryString = this.buildQueryString(filters);
    return this.fetchWithErrorHandling(`${API_BASE_URL}/customer-activity${queryString}`);
  }

  // Get scanning efficiency metrics
  async getScanningEfficiency(filters = {}) {
    const queryString = this.buildQueryString(filters);
    return this.fetchWithErrorHandling(`${API_BASE_URL}/scanning-efficiency${queryString}`);
  }
}

export default new ApiService();