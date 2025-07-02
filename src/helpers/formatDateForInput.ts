// Helper para formatear una cadena de fecha a 'YYYY-MM-DD' para inputs HTML.
export const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) {
        return '';
    }
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.warn(`Fecha inválida detectada para formateo: ${dateString}`);
            return '';
        }
        return date.toISOString().split('T')[0];
    } catch (e) {
        console.error(`Error al formatear la fecha "${dateString}":`, e);
        return '';
    }
};