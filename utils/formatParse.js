import moment from "moment";

export default async function formatParse(dato, camposTabla, obj) {
    camposTabla.forEach((campo) => {
        if (campo.formato == "date") {
            obj[campo.campo] = moment(dato[campo.campo]).isValid() ? moment(dato[campo.campo]).format("DD/MM/YYYY") : "";
        }
        else if (campo.formato == "minutos") {
            obj[campo.campo] = getMinFromSec(dato[campo.campo]);
        }
        else if (campo.formato == "datetime") {
            obj[campo.campo] = moment(dato[campo.campo]).isValid() ? moment(dato[campo.campo]).format("DD/MM/YYYY HH:mm:ss") : "";
        }
        else if (campo.formato == "hora") {
            obj[campo.campo] = moment(dato[campo.campo]).isValid() ? moment(dato[campo.campo]).format("HH:mm:ss") : "";
        }
        else if (campo.formato == "moneda") {
            obj[campo.campo] = formatearTotal(dato[campo.campo]);
        }
        else {
            obj[campo.campo] = dato[campo.campo] == null || dato[campo.campo] === "" ? "" : dato[campo.campo];
        }
        if (campo.virtual == "mes") {
            obj[campo.campo] = moment(dato[campo.origen]).format("MMMM");
        }
        if (campo.virtual == "año") {
            obj[campo.campo] = moment(dato[campo.origen]).format("YYYY");
        }
        if (campo.virtual == "dia") {
            obj[campo.campo] = getDiaSemanaEnBaseAFecha(dato[campo.origen]);
        }
        if (campo.virtual == "visto") {
            // si origen == 0, no visto
            // si origen >= 1, visto
            obj[campo.campo] = dato[campo.origen] >= 1 ? "✅" : "❌";

        }
        if (campo.virtual == "hora") {
            obj[campo.campo] = moment(dato[campo.origen]).format("HH:mm:ss");
        }
        if (campo.virtual == "fecha") {
            obj[campo.campo] = moment(dato[campo.origen]).format("DD/MM/YYYY");
        }
        if (campo.campo == "count") {
            obj[campo.campo] = 1;
        }
        if (campo.subformat == "array") {
            obj[campo.campo] = dato[campo.campo].join(", ");
        }
        if (campo.contar == true) {
            obj[campo.campo] = dato[campo.campo].length;
        }
    });

    return obj;
}
