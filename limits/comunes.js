export function comunes() {
    let lista = {
        rutasConRoles: [
            { nombre: "Inicio ", ruta: "/inicio", roles: [""] },
        ],
        rutasBaseRoles: [
            // { nombre: "Account", ruta: "/account", roles: [""] },
        ],
        routeDefaults: [
            { rol: "superAdmin", ruta: "/admin/gestion" },
        ]
    };
    return lista;
}