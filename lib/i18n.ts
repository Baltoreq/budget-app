import type { AppErrorCode } from "./appErrors";
import { isAppError } from "./appErrors";

export type LanguageCode = "pl" | "en";
export type CurrencyCode = "PLN" | "EUR" | "USD";

export const supportedLanguages = ["pl", "en"] as const;
export const supportedCurrencies = ["PLN", "EUR", "USD"] as const;

export interface LocalizationStrings {
  tabs: {
    dashboard: string;
    operations: string;
    analytics: string;
    more: string;
  };
  common: {
    total: string;
    income: string;
    expense: string;
    balance: string;
    operation: string;
    other: string;
    all: string;
    close: string;
    cancel: string;
    back: string;
    delete: string;
    save: string;
    info: string;
    select: string;
    search: string;
    showLess: string;
    showAll: string;
    resetFilters: string;
    currencyUnit: string;
  };
  home: {
    tagline: string;
    cardTitle: string;
    cardText: string;
    openApp: string;
    clearStorage: string;
  };
  onboarding: {
    titleLine1: string;
    titleLine2: string;
    subtitleLine1: string;
    subtitleLine2: string;
    subtitleLine3: string;
    incomeTitle: string;
    incomeDescriptionLine1: string;
    incomeDescriptionLine2: string;
    expenseTitle: string;
    expenseDescriptionLine1: string;
    expenseDescriptionLine2: string;
    analyticsTitle: string;
    analyticsDescriptionLine1: string;
    analyticsDescriptionLine2: string;
    startButton: string;
  };
  dashboard: {
    emptyTitle: string;
    emptyText: string;
    backButton: string;
    backToHome: string;
    monthBalance: string;
    openingBalance: string;
    totalIncome: string;
    totalExpense: string;
    closingBalance: string;
    expensesByCategory: string;
    expensesTotalSuffix: string;
    recentTransactions: string;
    noExpenses: string;
    noTransactions: string;
    noBudgetData: string;
    noBudgetDataText: string;
    showLess: string;
    showAll: string;
    addOperation: string;
    transactionIncome: string;
    transactionExpense: string;
    operationFallback: string;
  };
  operations: {
    emptyTitle: string;
    emptyText: string;
    addOperation: string;
    title: string;
    filterButton: string;
    sortButton: string;
    searchPlaceholder: string;
    searchLabel: string;
    monthCountOne: string;
    monthCountMany: string;
    monthLabel: string;
    incomeMetric: string;
    expenseMetric: string;
    balanceMetric: string;
    noResultsTitle: string;
    noResultsText: string;
    filterModalTitle: string;
    filterModalSubtitle: string;
    sortModalTitle: string;
    sortModalSubtitle: string;
    clearFilters: string;
    typeFilters: {
      all: string;
      income: string;
      expense: string;
    };
    sortOptions: {
      newest: string;
      oldest: string;
      amountAsc: string;
      amountDesc: string;
    };
    transactionIncome: string;
    transactionExpense: string;
    operationFallback: string;
  };
  addTransaction: {
    createTitle: string;
    editTitle: string;
    deleteIconLabel: string;
    backLabel: string;
    deleteOperation: string;
    typeIncome: string;
    typeExpense: string;
    amountLabel: string;
    amountPlaceholder: string;
    amountError: string;
    dateLabel: string;
    monthLabel: string;
    categoryLabel: string;
    categoryPlaceholder: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    infoTitle: string;
    infoText: string;
    saveChanges: string;
    saveOperation: string;
    deleteConfirmationTitle: string;
    deleteConfirmationText: string;
    deleteConfirmationCancel: string;
    deleteConfirmationConfirm: string;
    calendarPrevMonth: string;
    calendarNextMonth: string;
    calendarCancel: string;
    selectCategoryTitle: string;
    selectCategoryTypeHint: string;
    selectCategorySearchPlaceholder: string;
    selectCategorySearchLabel: string;
    selectCategoryEmptyTitle: string;
    selectCategoryEmptyText: string;
    selectCategoryManageLink: string;
    selectCategorySaveButton: string;
    operationMonthAutoNote: string;
  };
  more: {
    title: string;
    subtitle: string;
    sections: {
      budget: string;
      settings: string;
      appData: string;
      about: string;
    };
    items: {
      categories: string;
      openingBalance: string;
      currency: string;
      language: string;
      theme: string;
      deleteAll: string;
      about: string;
    };
    subtitles: {
      categories: string;
      openingBalance: string;
      deleteAll: string;
    };
    modalTitles: {
      currency: string;
      language: string;
      theme: string;
    };
    currencyChangeWarningTitle: string;
    currencyChangeWarningText: string;
    currencyChangeWarningConfirm: string;
    oneOptionAvailable: string;
    placeholderFallback: string;
    placeholderConfirm: string;
  };
  placeholders: {
    categories: string;
    openingBalance: string;
    deleteAll: string;
    about: string;
  };
  languages: {
    pl: string;
    en: string;
  };
  themes: {
    light: string;
  };
  currencies: {
    PLN: string;
    EUR: string;
    USD: string;
  };
  validation: {
    amountGreaterThanZero: string;
    selectCategory: string;
    saveFailed: string;
  };
  errors: Record<AppErrorCode, string>;
}

const translations: Record<LanguageCode, LocalizationStrings> = {
  pl: {
    tabs: {
      dashboard: "Dashboard",
      operations: "Operacje",
      analytics: "Analizy",
      more: "Więcej",
    },
    common: {
      total: "łącznie",
      income: "Wpływ",
      expense: "Wydatek",
      balance: "Saldo",
      operation: "Operacja",
      other: "Inne",
      all: "Wszystkie",
      close: "Zamknij",
      cancel: "Anuluj",
      back: "Wróć",
      delete: "Usuń",
      save: "Zapisz",
      info: "Informacja",
      select: "Wybierz",
      search: "Szukaj",
      showLess: "Pokaż mniej",
      showAll: "Zobacz wszystkie",
      resetFilters: "Wyczyść filtry",
      currencyUnit: "zł",
    },
    home: {
      tagline: "Ekran startowy aplikacji",
      cardTitle: "Wejdź do onboarding'u",
      cardText: "Otwórz ekran powitalny, aby zobaczyć układ przygotowany dokładnie pod załączony projekt.",
      openApp: "Otwórz aplikację",
      clearStorage: "Wyczyść dane aplikacji",
    },
    onboarding: {
      titleLine1: "Zadbaj o swój",
      titleLine2: "domowy budżet",
      subtitleLine1: "Śledź wpływy i wydatki, twórz własne",
      subtitleLine2: "kategorie i kontroluj każdy miesiąc",
      subtitleLine3: "w jednym miejscu.",
      incomeTitle: "Wpływy",
      incomeDescriptionLine1: "Rejestruj dochody",
      incomeDescriptionLine2: "i miej je pod kontrolą.",
      expenseTitle: "Wydatki",
      expenseDescriptionLine1: "Kategoryzuj wydatki",
      expenseDescriptionLine2: "i nie przekraczaj limitów.",
      analyticsTitle: "Analiza",
      analyticsDescriptionLine1: "Sprawdzaj raporty",
      analyticsDescriptionLine2: "i podejmuj lepsze decyzje.",
      startButton: "Zacznij",
    },
    dashboard: {
      emptyTitle: "Brak danych budżetu",
      emptyText: "Dodaj operacje, aby zobaczyć podsumowanie dashboardu.",
      backButton: "Wróć",
      backToHome: "Powrót do ekranu startowego",
      monthBalance: "Bilans miesiąca",
      openingBalance: "Saldo początkowe",
      totalIncome: "Suma wpływów",
      totalExpense: "Suma wydatków",
      closingBalance: "Saldo końcowe",
      expensesByCategory: "Wydatki według kategorii",
      expensesTotalSuffix: "łącznie",
      recentTransactions: "Ostatnie operacje",
      noExpenses: "Brak wydatków w tym miesiącu.",
      noTransactions: "Brak operacji w tym miesiącu.",
      noBudgetData: "Brak danych budżetu",
      noBudgetDataText: "Dodaj operacje, aby zobaczyć podsumowanie dashboardu.",
      showLess: "Pokaż mniej",
      showAll: "Zobacz wszystkie",
      addOperation: "Dodaj operację",
      transactionIncome: "Wpływ",
      transactionExpense: "Wydatek",
      operationFallback: "Operacja",
    },
    operations: {
      emptyTitle: "Brak operacji",
      emptyText: "Dodaj pierwszą operację, aby zobaczyć miesięczne podsumowanie i listę zapisów.",
      addOperation: "Dodaj operację",
      title: "Operacje",
      filterButton: "Filtruj",
      sortButton: "Sortuj",
      searchPlaceholder: "Szukaj operacji",
      searchLabel: "Szukaj operacji",
      monthCountOne: "1 operacja",
      monthCountMany: "operacji",
      monthLabel: "Miesiąc",
      incomeMetric: "Wpływy",
      expenseMetric: "Wydatki",
      balanceMetric: "Saldo",
      noResultsTitle: "Brak wyników",
      noResultsText: "Zmień miesiąc, filtr lub wyszukiwaną frazę, aby zobaczyć operacje.",
      filterModalTitle: "Filtruj operacje",
      filterModalSubtitle: "Wybierz typ operacji, który chcesz zobaczyć.",
      sortModalTitle: "Sortuj operacje",
      sortModalSubtitle: "Zmień kolejność wyświetlania listy.",
      clearFilters: "Wyczyść filtry",
      typeFilters: {
        all: "Wszystkie",
        income: "Wpływy",
        expense: "Wydatki",
      },
      sortOptions: {
        newest: "Najnowsze najpierw",
        oldest: "Najstarsze najpierw",
        amountAsc: "Kwota rosnąco",
        amountDesc: "Kwota malejąco",
      },
      transactionIncome: "Wpływ",
      transactionExpense: "Wydatek",
      operationFallback: "Operacja",
    },
    addTransaction: {
      createTitle: "Dodaj operację",
      editTitle: "Edytuj operację",
      deleteIconLabel: "Usuń operację",
      backLabel: "Wróć",
      deleteOperation: "Usuń",
      typeIncome: "Wpływ",
      typeExpense: "Wydatek",
      amountLabel: "Kwota",
      amountPlaceholder: "0,00",
      amountError: "Kwota musi być większa od zera",
      dateLabel: "Data operacji",
      monthLabel: "Miesiąc operacji",
      categoryLabel: "Kategoria",
      categoryPlaceholder: "Wybierz kategorię",
      descriptionLabel: "Opis (opcjonalnie)",
      descriptionPlaceholder: "Dodaj opis...",
      infoTitle: "Informacja",
      infoText: "Miesiąc operacji jest uzupełniany automatycznie na podstawie podanej daty i nie można go zmienić ręcznie.",
      saveChanges: "Zapisz zmiany",
      saveOperation: "Zapisz operację",
      deleteConfirmationTitle: "Usunąć operację?",
      deleteConfirmationText: "Tej akcji nie można cofnąć.",
      deleteConfirmationCancel: "Anuluj",
      deleteConfirmationConfirm: "Usuń",
      calendarPrevMonth: "Poprzedni miesiąc",
      calendarNextMonth: "Następny miesiąc",
      calendarCancel: "Anuluj",
      selectCategoryTitle: "Wybierz kategorię",
      selectCategoryTypeHint: "Pokazano tylko kategorie pasujące do typu operacji.",
      selectCategorySearchPlaceholder: "Szukaj kategorii",
      selectCategorySearchLabel: "Szukaj kategorii",
      selectCategoryEmptyTitle: "Brak wyników",
      selectCategoryEmptyText: "Zmień wpisaną frazę, aby znaleźć kategorię.",
      selectCategoryManageLink: "Zarządzaj kategoriami",
      selectCategorySaveButton: "Zapisz wybór",
      operationMonthAutoNote: "Miesiąc operacji jest uzupełniany automatycznie na podstawie podanej daty i nie można go zmienić ręcznie.",
    },
    more: {
      title: "Więcej",
      subtitle: "Zarządzaj ustawieniami i dodatkowymi opcjami aplikacji.",
      sections: {
        budget: "Budżet",
        settings: "Ustawienia",
        appData: "Dane aplikacji",
        about: "Informacje",
      },
      items: {
        categories: "Kategorie",
        openingBalance: "Saldo początkowe",
        currency: "Waluta",
        language: "Język",
        theme: "Motyw",
        deleteAll: "Usuń wszystkie dane",
        about: "O aplikacji",
      },
      subtitles: {
        categories: "Zarządzaj kategoriami wpływów i wydatków",
        openingBalance: "Ustaw saldo początkowe dla wybranego miesiąca",
        deleteAll: "Trwale usuń wszystkie zapisane informacje",
      },
      modalTitles: {
        currency: "Wybierz walutę",
        language: "Wybierz język",
        theme: "Wybierz motyw",
      },
      currencyChangeWarningTitle: "Zmienić walutę wyświetlania?",
      currencyChangeWarningText: "Zmiana waluty wpływa tylko na sposób wyświetlania kwot. Wartości liczbowe nie zostaną przeliczone.",
      currencyChangeWarningConfirm: "Zmień walutę",
      oneOptionAvailable: "Aktualnie dostępna jest jedna opcja.",
      placeholderFallback: "Ta sekcja jest placeholderem i zostanie uzupełniona w kolejnym kroku.",
      placeholderConfirm: "Rozumiem",
    },
    placeholders: {
      categories: "Kategorie",
      openingBalance: "Saldo początkowe",
      deleteAll: "Usuń wszystkie dane",
      about: "O aplikacji",
    },
    languages: {
      pl: "Polski",
      en: "Angielski",
    },
    themes: {
      light: "Jasny",
    },
    currencies: {
      PLN: "PLN (zł)",
      EUR: "EUR (€)",
      USD: "USD ($)",
    },
    validation: {
      amountGreaterThanZero: "Kwota musi być większa od zera.",
      selectCategory: "Wybierz kategorię operacji.",
      saveFailed: "Nie udało się zapisać operacji. Spróbuj ponownie.",
    },
    errors: {
      "amount-minor-integer": "Kwota musi być liczbą całkowitą w mniejszych jednostkach.",
      "amount-minor-positive": "Kwota musi być dodatnią liczbą całkowitą w mniejszych jednostkach.",
      "date-format-invalid": "Data operacji musi mieć format YYYY-MM-DD.",
      "date-invalid": "Data operacji jest nieprawidłowa.",
      "month-format-invalid": "Miesiąc przypisania musi mieć format YYYY-MM.",
      "month-invalid": "Miesiąc przypisania jest nieprawidłowy.",
      "category-name-required": "Nazwa kategorii jest wymagana.",
      "category-name-duplicate": "Kategoria o tej nazwie już istnieje dla tego typu.",
      "category-in-use": "Nie można usunąć tej kategorii, ponieważ jest przypisana do istniejących operacji. Najpierw usuń powiązane operacje lub zmień ich kategorię.",
      "category-not-found": "Nie znaleziono kategorii.",
      "transaction-not-found": "Nie znaleziono operacji.",
      "category-missing": "Wybrana kategoria nie istnieje.",
      "transaction-type-mismatch": "Typ operacji musi odpowiadać typowi kategorii.",
      "opening-balance-integer": "Saldo początkowe musi być liczbą całkowitą w mniejszych jednostkach.",
    },
  },
  en: {
    tabs: {
      dashboard: "Dashboard",
      operations: "Operations",
      analytics: "Analytics",
      more: "More",
    },
    common: {
      total: "total",
      income: "Income",
      expense: "Expense",
      balance: "Balance",
      operation: "Operation",
      other: "Other",
      all: "All",
      close: "Close",
      cancel: "Cancel",
      back: "Back",
      delete: "Delete",
      save: "Save",
      info: "Info",
      select: "Select",
      search: "Search",
      showLess: "Show less",
      showAll: "Show all",
      resetFilters: "Reset filters",
      currencyUnit: "PLN",
    },
    home: {
      tagline: "App home screen",
      cardTitle: "Open the onboarding",
      cardText: "Open the welcome screen to see the layout prepared exactly for the provided design.",
      openApp: "Open app",
      clearStorage: "Clear app data",
    },
    onboarding: {
      titleLine1: "Take control of your",
      titleLine2: "household budget",
      subtitleLine1: "Track income and expenses, create your own",
      subtitleLine2: "categories, and keep every month under control",
      subtitleLine3: "in one place.",
      incomeTitle: "Income",
      incomeDescriptionLine1: "Record earnings",
      incomeDescriptionLine2: "and keep them under control.",
      expenseTitle: "Expenses",
      expenseDescriptionLine1: "Categorize spending",
      expenseDescriptionLine2: "and stay within limits.",
      analyticsTitle: "Insights",
      analyticsDescriptionLine1: "Review reports",
      analyticsDescriptionLine2: "and make better decisions.",
      startButton: "Get started",
    },
    dashboard: {
      emptyTitle: "No budget data",
      emptyText: "Add operations to see the dashboard summary.",
      backButton: "Back",
      backToHome: "Back to home screen",
      monthBalance: "Monthly result",
      openingBalance: "Opening balance",
      totalIncome: "Total income",
      totalExpense: "Total expenses",
      closingBalance: "Closing balance",
      expensesByCategory: "Expenses by category",
      expensesTotalSuffix: "total",
      recentTransactions: "Recent operations",
      noExpenses: "No expenses this month.",
      noTransactions: "No operations this month.",
      noBudgetData: "No budget data",
      noBudgetDataText: "Add operations to see the dashboard summary.",
      showLess: "Show less",
      showAll: "Show all",
      addOperation: "Add operation",
      transactionIncome: "Income",
      transactionExpense: "Expense",
      operationFallback: "Operation",
    },
    operations: {
      emptyTitle: "No operations",
      emptyText: "Add your first operation to see the monthly summary and entry list.",
      addOperation: "Add operation",
      title: "Operations",
      filterButton: "Filter",
      sortButton: "Sort",
      searchPlaceholder: "Search operations",
      searchLabel: "Search operations",
      monthCountOne: "1 operation",
      monthCountMany: "operations",
      monthLabel: "Month",
      incomeMetric: "Income",
      expenseMetric: "Expenses",
      balanceMetric: "Balance",
      noResultsTitle: "No results",
      noResultsText: "Change the month, filter, or search term to see operations.",
      filterModalTitle: "Filter operations",
      filterModalSubtitle: "Choose the operation type you want to see.",
      sortModalTitle: "Sort operations",
      sortModalSubtitle: "Change the order of the list.",
      clearFilters: "Clear filters",
      typeFilters: {
        all: "All",
        income: "Income",
        expense: "Expenses",
      },
      sortOptions: {
        newest: "Newest first",
        oldest: "Oldest first",
        amountAsc: "Amount ascending",
        amountDesc: "Amount descending",
      },
      transactionIncome: "Income",
      transactionExpense: "Expense",
      operationFallback: "Operation",
    },
    addTransaction: {
      createTitle: "Add operation",
      editTitle: "Edit operation",
      deleteIconLabel: "Delete operation",
      backLabel: "Back",
      deleteOperation: "Delete",
      typeIncome: "Income",
      typeExpense: "Expense",
      amountLabel: "Amount",
      amountPlaceholder: "0.00",
      amountError: "Amount must be greater than zero",
      dateLabel: "Operation date",
      monthLabel: "Operation month",
      categoryLabel: "Category",
      categoryPlaceholder: "Choose category",
      descriptionLabel: "Description (optional)",
      descriptionPlaceholder: "Add a description...",
      infoTitle: "Info",
      infoText: "The operation month is filled automatically from the provided date and cannot be edited manually.",
      saveChanges: "Save changes",
      saveOperation: "Save operation",
      deleteConfirmationTitle: "Delete operation?",
      deleteConfirmationText: "This action cannot be undone.",
      deleteConfirmationCancel: "Cancel",
      deleteConfirmationConfirm: "Delete",
      calendarPrevMonth: "Previous month",
      calendarNextMonth: "Next month",
      calendarCancel: "Cancel",
      selectCategoryTitle: "Choose category",
      selectCategoryTypeHint: "Only categories matching the operation type are shown.",
      selectCategorySearchPlaceholder: "Search categories",
      selectCategorySearchLabel: "Search categories",
      selectCategoryEmptyTitle: "No results",
      selectCategoryEmptyText: "Change the entered text to find a category.",
      selectCategoryManageLink: "Manage categories",
      selectCategorySaveButton: "Save selection",
      operationMonthAutoNote: "The operation month is filled automatically from the provided date and cannot be edited manually.",
    },
    more: {
      title: "More",
      subtitle: "Manage app settings and additional options.",
      sections: {
        budget: "Budget",
        settings: "Settings",
        appData: "App data",
        about: "About",
      },
      items: {
        categories: "Categories",
        openingBalance: "Opening balance",
        currency: "Currency",
        language: "Language",
        theme: "Theme",
        deleteAll: "Delete all data",
        about: "About app",
      },
      subtitles: {
        categories: "Manage income and expense categories",
        openingBalance: "Set the opening balance for the selected month",
        deleteAll: "Permanently delete all saved information",
      },
      modalTitles: {
        currency: "Choose currency",
        language: "Choose language",
        theme: "Choose theme",
      },
      currencyChangeWarningTitle: "Change display currency?",
      currencyChangeWarningText: "Changing currency only updates how amounts are displayed. Stored numeric values are not converted.",
      currencyChangeWarningConfirm: "Change currency",
      oneOptionAvailable: "Only one option is currently available.",
      placeholderFallback: "This section is a placeholder and will be completed in the next step.",
      placeholderConfirm: "Got it",
    },
    placeholders: {
      categories: "Categories",
      openingBalance: "Opening balance",
      deleteAll: "Delete all data",
      about: "About app",
    },
    languages: {
      pl: "Polish",
      en: "English",
    },
    themes: {
      light: "Light",
    },
    currencies: {
      PLN: "PLN (zł)",
      EUR: "EUR (€)",
      USD: "USD ($)",
    },
    validation: {
      amountGreaterThanZero: "Amount must be greater than zero.",
      selectCategory: "Choose an operation category.",
      saveFailed: "Could not save the operation. Please try again.",
    },
    errors: {
      "amount-minor-integer": "Amount must be an integer in minor units.",
      "amount-minor-positive": "Amount must be a positive integer in minor units.",
      "date-format-invalid": "Operation date must use the YYYY-MM-DD format.",
      "date-invalid": "Operation date is invalid.",
      "month-format-invalid": "Assigned month must use the YYYY-MM format.",
      "month-invalid": "Assigned month is invalid.",
      "category-name-required": "Category name is required.",
      "category-name-duplicate": "A category with this name already exists for this type.",
      "category-in-use": "This category cannot be deleted because it is assigned to existing operations. Delete the linked operations first or change their category.",
      "category-not-found": "Category not found.",
      "transaction-not-found": "Operation not found.",
      "category-missing": "The selected category does not exist.",
      "transaction-type-mismatch": "Operation type must match the category type.",
      "opening-balance-integer": "Opening balance must be an integer in minor units.",
    },
  },
};

function capitalize(value: string): string {
  if (!value) {
    return value;
  }

  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function getLocaleForLanguage(language: LanguageCode): string {
  return language === "en" ? "en-US" : "pl-PL";
}

function getSystemLocale(): string {
  const intlLocale = new Intl.DateTimeFormat().resolvedOptions().locale;

  if (intlLocale) {
    return intlLocale;
  }

  const navigatorLocale = typeof navigator !== "undefined" ? navigator.language : null;
  return navigatorLocale ?? "pl-PL";
}

function getRegionFromLocale(locale: string): string | null {
  const normalized = locale.replace("_", "-");
  const parts = normalized.split("-");

  for (let index = 1; index < parts.length; index += 1) {
    const part = parts[index];
    if (/^[A-Za-z]{2}$/.test(part)) {
      return part.toUpperCase();
    }
  }

  return null;
}

const euroRegions = new Set([
  "AT",
  "BE",
  "CY",
  "DE",
  "EE",
  "ES",
  "FI",
  "FR",
  "GR",
  "HR",
  "IE",
  "IT",
  "LT",
  "LU",
  "LV",
  "MT",
  "NL",
  "PT",
  "SI",
  "SK",
]);

export function detectPreferredLanguage(locale = getSystemLocale()): LanguageCode {
  const normalized = locale.toLowerCase();

  if (normalized.startsWith("en")) {
    return "en";
  }

  return "pl";
}

export function detectPreferredCurrency(locale = getSystemLocale()): CurrencyCode {
  const normalized = locale.toLowerCase();
  const region = getRegionFromLocale(locale);

  if (region === "PL" || normalized.startsWith("pl")) {
    return "PLN";
  }

  if (region === "US") {
    return "USD";
  }

  if (region && euroRegions.has(region)) {
    return "EUR";
  }

  if (normalized.startsWith("en")) {
    return "USD";
  }

  return "PLN";
}

function createWeekdayLabels(locale: string): string[] {
  const baseDate = new Date(Date.UTC(2024, 0, 1));

  return Array.from({ length: 7 }, (_, index) => {
    const label = new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(baseDate.getTime() + (index * 24 * 60 * 60 * 1000)));
    return capitalize(label.replace(/\./g, "").trim());
  });
}

function createFormatters(language: LanguageCode, currencyCode: CurrencyCode) {
  const locale = getLocaleForLanguage(language);
  const monthFormatter = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  });
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const currencyFormatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const currencySymbolFormatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  const currencySymbol = currencySymbolFormatter
    .formatToParts(0)
    .find((part) => part.type === "currency")?.value ?? currencyCode;
  const operationDateDisplayFormatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const operationWeekdayDisplayFormatter = new Intl.DateTimeFormat(locale, {
    weekday: "short",
  });
  const operationMonthDisplayFormatter = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  });
  const amountInputFormatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false,
  });

  return {
    locale,
    currencyCode,
    currencySymbol,
    formatMinorCurrency(amountMinor: number): string {
      return currencyFormatter.format(amountMinor / 100);
    },
    formatSignedMinorCurrency(amountMinor: number): string {
      const sign = amountMinor > 0 ? "+" : amountMinor < 0 ? "-" : "";
      return `${sign}${currencyFormatter.format(Math.abs(amountMinor) / 100)}`;
    },
    formatAmountInput(amountMinor: number): string {
      return amountInputFormatter.format(amountMinor / 100);
    },
    formatMonthLabel(yearMonth: string): string {
      const [yearPart, monthPart] = yearMonth.split("-").map((value) => Number(value));
      const formatted = monthFormatter.format(new Date(yearPart, monthPart - 1, 1));
      return capitalize(formatted);
    },
    formatOperationDate(dateOnly: string): string {
      const [yearPart, monthPart, dayPart] = dateOnly.split("-").map((value) => Number(value));
      return dateFormatter.format(new Date(yearPart, monthPart - 1, dayPart));
    },
    formatOperationDateWithWeekday(date: Date): string {
      return `${operationDateDisplayFormatter.format(date)} (${operationWeekdayDisplayFormatter.format(date)})`;
    },
    formatOperationMonthFromDate(date: Date): string {
      return capitalize(operationMonthDisplayFormatter.format(date));
    },
    calendarWeekdayLabels: createWeekdayLabels(locale),
    normalizeSearchValue(value: string): string {
      return value
        .trim()
        .toLocaleLowerCase(locale)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ł/g, "l");
    },
    formatOperationCount(count: number): string {
      if (language === "pl") {
        return count === 1 ? "1 operacja" : `${count} operacji`;
      }

      return count === 1 ? "1 operation" : `${count} operations`;
    },
  };
}

const errorMessages: Record<LanguageCode, Record<AppErrorCode, string>> = {
  pl: translations.pl.errors,
  en: translations.en.errors,
};

function isKnownAppErrorCode(value: string): value is AppErrorCode {
  return value in errorMessages.en;
}

export function createLocalizationBundle(language: LanguageCode, currencyCode: CurrencyCode) {
  return {
    language,
    currencyCode,
    locale: getLocaleForLanguage(language),
    strings: translations[language],
    formatters: createFormatters(language, currencyCode),
  };
}

export function translateAppErrorMessage(language: LanguageCode, error: unknown): string {
  if (isAppError(error)) {
    return errorMessages[language][error.code];
  }

  if (error instanceof Error) {
    const candidate = error.message;
    if (isKnownAppErrorCode(candidate)) {
      return errorMessages[language][candidate];
    }

    return error.message;
  }

  return language === "pl"
    ? translations.pl.validation.saveFailed
    : translations.en.validation.saveFailed;
}
