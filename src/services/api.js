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
    if (filters.month !== undefined && filters.month !== null && filters.month !== '') params.append('month', filters.month);
    if (filters.year !== undefined && filters.year !== null && filters.year !== '') params.append('year', filters.year);
    if (filters.quarter !== undefined && filters.quarter !== null && filters.quarter !== '') params.append('quarter', filters.quarter);
    if (filters.week !== undefined && filters.week !== null && filters.week !== '') params.append('week', filters.week);
    if (filters.lastDays !== undefined && filters.lastDays !== null && filters.lastDays !== '') params.append('lastDays', filters.lastDays);
    if (filters.dateFrom !== undefined && filters.dateFrom !== null && filters.dateFrom !== '') params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo !== undefined && filters.dateTo !== null && filters.dateTo !== '') params.append('dateTo', filters.dateTo);
    if (filters.city !== undefined && filters.city !== null && filters.city !== '') params.append('city', filters.city);
    if (filters.volumeLevel !== undefined && filters.volumeLevel !== null && filters.volumeLevel !== '') params.append('volumeLevel', filters.volumeLevel);
    if (filters.customerActivity !== undefined && filters.customerActivity !== null && filters.customerActivity !== '') params.append('customerActivity', filters.customerActivity);
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
    const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11 (July = 7)
    const currentYear = now.getFullYear();   // 2025
    
    // Calculate start date (11 months ago + current month = 12 months total)
    // For July 2025, we want Aug 2024 to Jul 2025 (12 months)
    let startMonth = currentMonth + 1; // 8 (August)
    let startYear = currentYear - 1;   // 2024
    
    // Handle year wrap-around for months after December
    if (startMonth > 12) {
      startMonth = startMonth - 12; // Convert to proper month
      startYear = currentYear;       // Use current year
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
    
    // Debug logging
    console.log('Rolling 12-month filters:', {
      dateFrom: rollingFilters.dateFrom,
      dateTo: rollingFilters.dateTo,
      currentMonth,
      currentYear,
      startMonth,
      startYear,
      originalFilters: filters
    });
    
    const queryString = this.buildQueryString(rollingFilters);
    console.log('Query string:', queryString);
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