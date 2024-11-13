import "server-only";

const dictionaries = {
  en: () =>
    import("./config/messages/en.json").then((module) => module.default),
};

export const getDictionary = async (locale: "en" = "en") =>
  dictionaries[locale]();
