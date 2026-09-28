/**
 * Copy for the example feature.
 *
 * Validation strings live under each view's `validation` block because the zod
 * schemas store translation *keys* rather than finished sentences — the form
 * translates at render time, so an error message follows the active language
 * without the schema ever knowing one exists.
 */
export default {
  title: "Feature Examples",
  subtitle: "Realistic screens wired to the plugins this boilerplate ships",

  products: {
    title: "Products",
    subtitle: "React Query, infinite scroll, and FlashList against a live API",

    search: {
      placeholder: "Search products",
    },

    empty: {
      title: "No products found",
      description: "Try a different search term.",
    },

    error: {
      title: "Could not load products",
    },

    stock: "{{count}} in stock",
    outOfStock: "Out of stock",

    detail: {
      tab: {
        overview: "Overview",
        specs: "Specs",
        reviews: "Reviews",
      },
      brand: "Brand",
      category: "Category",
      rating: "Rating",
      stock: "Stock",
      discount: "Discount",
      noReviews: "No reviews yet",
      action: "Add to cart",
      sheetTitle: "Add to cart",
      quantity: "Quantity",
      confirm: "Confirm",
      added: "Added to cart",
      notFound: "That product no longer exists.",
    },
  },

  todos: {
    title: "Todos",
    subtitle: "Zustand persisted to MMKV — this one works offline",

    field: {
      title: {
        placeholder: "What needs doing?",
      },
    },

    validation: {
      titleMin: "Write at least 3 characters",
      titleMax: "Keep it under 100 characters",
    },

    action: {
      add: "Add",
      clearCompleted: "Clear completed",
    },

    filter: {
      all: "All",
      active: "Active",
      done: "Done",
    },

    progress: "{{done}} of {{total}} done",

    empty: {
      title: "Nothing to do",
      description: "Add your first task above. It survives a restart.",
    },

    remove: {
      title: "Delete this task?",
      description: "This cannot be undone.",
    },

    toast: {
      added: "Task added",
      removed: "Task deleted",
      cleared: "Completed tasks cleared",
    },
  },

  settings: {
    title: "Settings",
    subtitle: "Theme, language, and preferences persisted across restarts",

    appearance: {
      title: "Appearance",
      theme: "Color scheme",
    },

    language: {
      title: "Language",
      label: "App language",
    },

    notifications: {
      title: "Notifications",
      push: "Push notifications",
      pushDescription: "Alerts for new messages",
      email: "Email digest",
      emailDescription: "A weekly summary",
    },

    formatting: {
      title: "Formatting preview",
      description: "These follow the language above, not the device.",
      number: "Number",
      currency: "Currency",
      date: "Date",
      relative: "Relative time",
    },
  },
};
