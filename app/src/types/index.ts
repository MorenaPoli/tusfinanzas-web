export type TransactionType = 'income' | 'expense' | 'investment' | 'debt' | 'asset';

export const INCOME_CATEGORIES = ['Salario', 'Freelance', 'Dividendos', 'Alquileres', 'Negocio', 'Regalos', 'Otros ing.'];
export const EXPENSE_CATEGORIES = ['Comida', 'Transporte', 'Vivienda', 'Servicios', 'Salud', 'Educacion', 'Ocio', 'Compras', 'Otros gas.'];
export const INVESTMENT_CATEGORIES = ['ETFs', 'Acciones', 'Crypto', 'Bonos', 'Fondo comun', 'Otros inv.'];
export const DEBT_CATEGORIES = ['Tarjeta de credito', 'Prestamo personal', 'Hipoteca', 'Deuda familiar', 'Otros deudas'];
export const ASSET_CATEGORIES = ['Auto', 'Celular', 'PC / Notebook', 'Propiedad', 'Joyas / Reloj', 'Muebles', 'Electronica', 'Colecciones', 'Otros bienes'];

export function getCategoriesByType(type: TransactionType): string[] {
  switch (type) {
    case 'income': return INCOME_CATEGORIES;
    case 'expense': return EXPENSE_CATEGORIES;
    case 'investment': return INVESTMENT_CATEGORIES;
    case 'debt': return DEBT_CATEGORIES;
    case 'asset': return ASSET_CATEGORIES;
  }
}

export const TYPE_LABELS: Record<TransactionType, string> = {
  income: 'Ingreso',
  expense: 'Gasto',
  investment: 'Inversion',
  debt: 'Deuda',
  asset: 'Bien / Activo',
};

export const TYPE_COLORS: Record<TransactionType, string> = {
  income: '#00E5FF',
  expense: '#FF4D6A',
  investment: '#6366F1',
  debt: '#EF4444',
  asset: '#8B5CF6',
};

export const QUOTES_BY_TYPE = {
  excellent: [
    'Tu patrimonio crece. Segui asi y vas a llegar lejos.',
    'Excelente mes. Tu disciplina financiera da resultados.',
    'Estas construyendo un futuro solido. Bien hecho.',
    'Tus inversiones trabajan para vos. El efecto compuesto es tu aliado.',
  ],
  good: [
    'Vas por buen camino. Unos ajustes mas y llegas a excelente.',
    'Tu balance es positivo. Mantene el ritmo.',
    'Buen trabajo ahorrando. Pensa en diversificar.',
    'Lo hiciste bien este mes. Sigue la estrategia.',
  ],
  regular: [
    'Revisa esos gastos chicos que se acumulan.',
    'Estas en equilibrio pero sin margen. Ojo con los gastos.',
    'Un presupuesto estricto te ayudaria a ahorrar mas.',
    'Pequenos cambios en tus habitudes = grandes resultados.',
  ],
  critical: [
    'Gastas mas de lo que ingresa. Necesitas un plan URGENTE.',
    'Crisis financiera detectada. Corta gastos YA.',
    'Hoy no gastes mas. Prioriza lo esencial.',
    'Tu deuda crece. Buscá ayuda profesional.',
  ],
};
