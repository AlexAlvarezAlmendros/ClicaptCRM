import { create } from "zustand";

export const useFiltersStore = create((set) => ({
  // Contact filters
  contacts: {
    search: "",
    status: "",
    source: "",
    group_id: "",
    tag: "",
    page: 1,
    limit: 25,
  },
  setContactFilters: (filters) =>
    set((s) => ({
      contacts: { ...s.contacts, ...filters, page: filters.page ?? 1 },
    })),
  resetContactFilters: () =>
    set({
      contacts: { search: "", status: "", source: "", group_id: "", tag: "", page: 1, limit: 25 },
    }),

  // Deal filters
  deals: {
    search: "",
    stage_id: "",
    page: 1,
    limit: 50,
  },
  setDealFilters: (filters) =>
    set((s) => ({
      deals: { ...s.deals, ...filters, page: filters.page ?? 1 },
    })),
  resetDealFilters: () =>
    set({
      deals: { search: "", stage_id: "", page: 1, limit: 50 },
    }),

  // Task filters
  tasks: {
    filter: "today",
    search: "",
    page: 1,
    limit: 25,
  },
  setTaskFilters: (filters) =>
    set((s) => ({
      tasks: { ...s.tasks, ...filters, page: filters.page ?? 1 },
    })),
  resetTaskFilters: () =>
    set({
      tasks: { filter: "today", search: "", page: 1, limit: 25 },
    }),
}));
