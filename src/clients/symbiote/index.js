import { getOptions, saveOption } from "~/utils/storage";

const main = async () => {
  await getOptions();

  const href = window.location.href;
  await saveOption("symbioteURL", href.substring(0, href.lastIndexOf("/")));

  window.location.href =
    "https://www.dndbeyond.com/sign-in?returnUrl=/characters";
};

main();
