export default function crearUrl(extra) {
    let currentPath = "";
    const { protocol, hostname, port } = window.location
    // const url = `${protocol}//${hostname}:${port}`
    const url = new URL(window.location.href)
    currentPath = `${url.hostname}${url.port ? `:${url.port}` : ''}`
    // currentPath = `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ''}`
     //todoUrl.value = currentPath.value + extra;
     if (extra === undefined) {
         return currentPath;
     }
    return currentPath + extra;
}
