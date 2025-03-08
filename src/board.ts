import { refObject as _refObject } from "@tabletop-playground/api";

const refObject = _refObject;

// @ts-expect-error assign
refObject.setup = () => {
  switch (refObject.getTemplateId()) {
    case "300F62A0D44DB4F40DA0E4A328CB3758": // bluefin squadron
      // flagship, patrols, strongholds, reference
      break;
    case "7A8D72AAA64A2A976DCE2A9602C41680": // red smuggler
      // flagship, pledges, reference
      break;
    case "19F163665B477FC3B87512BEC2175203": // mollusk union
      // flagship, comrades, plans, cutter, gunship
      break;
    case "B0DF59A6A844E2CBF4DF44BE8BE35692": // white smuggler
      // flagship, pledges, reference
      break;
  }
};
