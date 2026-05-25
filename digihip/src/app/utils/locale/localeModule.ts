import { el } from "date-fns/locale";

export const customLocale = {
  ...el,
  localize: {
    ...el.localize,
    month: (n: number) =>
      [
        "Ιανουάριος",
        "Φεβρουάριος",
        "Μάρτιος",
        "Απρίλιος",
        "Μάιος",
        "Ιούνιος",
        "Ιούλιος",
        "Αύγουστος",
        "Σεπτέμβριος",
        "Οκτώβριος",
        "Νοέμβριος",
        "Δεκέμβριος",
      ][n] || "",
  },
};
