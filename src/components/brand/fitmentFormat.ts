import type { ClientFitment } from '../../data/clientFitments';

/** The car, e.g. "G80 M3" or "AUDI 8Y RS3". The data stores "G80 M3 — BROOKLYN GREY" in capitals. */
export const fitmentCar = (fitment: Pick<ClientFitment, 'vehicleTitle'>): string =>
  fitment.vehicleTitle.split(' — ')[0].trim();

/** Car and paint as one readable line, e.g. "G80 M3, Brooklyn Grey". */
export const fitmentTitle = (fitment: Pick<ClientFitment, 'vehicleTitle' | 'paint'>): string =>
  fitment.paint ? `${fitmentCar(fitment)}, ${fitment.paint}` : fitmentCar(fitment);

/** What is on the car: the catalogue wheel when one is recorded, otherwise a description of the photo. */
export const fitmentWheels = (
  fitment: Pick<ClientFitment, 'wheelModel' | 'wheelLook'>,
): string => fitment.wheelModel ?? fitment.wheelLook;

/** The text WhatsApp opens with for "Ask about this setup". It names the car so nobody has to retype it. */
export const fitmentMessage = (
  fitment: Pick<ClientFitment, 'vehicleTitle' | 'paint' | 'wheelModel' | 'wheelLook'>,
): string =>
  `Hi, I'd like to ask about this setup from your installs page: ${fitmentTitle(fitment)}. Wheels: ${fitmentWheels(fitment)}.`;
