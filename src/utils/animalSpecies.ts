
export const getSpeciesText = (species: string) => {
  switch (species) {
    case 'bovino':
      return 'Bovino';
    case 'ovino':
      return 'Ovino';
    case 'caprino':
      return 'Caprino';
    case 'porcino':
      return 'Porcino';
    case 'equino':
      return 'Equino';
    case 'aviar':
      return 'Aviar';
    case 'canine':
      return 'Canino';
    default:
      return species.charAt(0).toUpperCase() + species.slice(1);
  }
};
