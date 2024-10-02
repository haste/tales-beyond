import { getOptions, saveOption } from "~/utils/storage";

getOptions();

const href = window.location.href;
saveOption("symbioteURL", href.substring(0, href.lastIndexOf("/")));

window.location.href =
  "https://www.dndbeyond.com/sign-in?returnUrl=/characters";
