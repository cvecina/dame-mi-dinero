export default function getCampoNombre(campo, array, store) {
    let dato = store[array].find((selector) => selector.campo === campo);
    return dato;
};