
export class BreedingStatusTranslator {
  
  static translateStatus(status: string): string {
    const translations: Record<string, string> = {
      'planned': 'Planeado',
      'confirmed_pregnant': 'Embarazo Confirmado',
      'birth_completed': 'Parto Completado',
      'not_pregnant': 'No Embarazada',
      'failed': 'Fallido',
      'completed': 'Completado'
    };
    return translations[status] || status;
  }
}
