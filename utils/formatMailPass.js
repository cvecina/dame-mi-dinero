export default function formatMailPass(dato, tipo) {
    switch (tipo) {
        case "mail":
            let datoNew;
            // make a trim and toLowerCase
            datoNew = dato.trim().toLowerCase();
            return datoNew;
        case "pass":
            return dato.trim();
    }
};