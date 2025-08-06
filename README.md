# Nuxt Template

Nuxt Template es una estructura para crear aplicaciones web de manera ágil que utiliza varias tecnologías y trae diferentes funcionalidades pre-diseñadas.

## Características
- **Componentes default**: El programa viene preparado con un login, registro, cambio de contraseña y con varios componentes útiles como tablas, formularios, buscadores...

## Ejemplo de uso Formulario dinámico
Hay props obligatorios:
- titulo
- datos
- camposTabla

Datos ha de ser un array de objetos para funcionar.

```javascript
 <TablaDefault
      titulo="Configuración de eventos"
      :datos="eventosStore.allFiltrado"
      :camposTabla="eventosStore.camposTabla"
      :editar="editarEvento"
      :remove="eliminarEvento"
      :totalData="eventosStore.totalData"
      :limit="eventosStore.limit"
      :isActive="true"
      :offset="eventosStore.offset"
      @cambiarPagina="cambiarPagina($event)"
      @cambiarEstadoUser="checkEstadoCambiar"
    >
      <template #zona__izquierda>
        <Buscador @buscarDatos="buscarDatos" />
      </template>
      <template #zona__derecha>
        <button class="boton__empresa p-2 m-2 rounded" @click="insertEvent">
          Insertar
        </button>
      </template>
    </TablaDefault>

// campos tabla ejemplo
const camposTabla = [
[
            { campo: "id", tipo: "text", visible: false, label: "ID", activo: true },
            { campo: "dias_activo", tipo: "text", contar: true, subformat: "array", visible: true, label: "Días", activo: true },
            { campo: "disabled", tipo: "text", formato: "bool", visible: false, label: "Disabled", activo: true },
            { campo: "periodo", tipo: "text", visible: true, label: "Periodo", activo: true },
            { campo: "segundos", formato: "minutos", tipo: "text", visible: true, label: "Duración", activo: true },
            { campo: "tipo_envio", tipo: "text", visible: true, label: "Envío", activo: true },
            { campo: "createdAt", tipo: "text", formato: "datetime", visible: true, label: "Momento", activo: false },
            { campo: "eventos_por_dia", tipo: "text", contar: true, subformat: "array", visible: true, label: "Eventos por día", activo: true },
            { campo: "festivos", tipo: "text", subformat: "array", contar: true, visible: true, label: "Festivos", activo: true },
        ]
];
```

Como se puede observar, hay un template en medio del form. se puede añadir como #extra un template ya que hay ```<slots>``` dentro.

## Ejemplo de uso Formulario dinámico
Hay props obligatorios:
- titulo
- camposFormulario
- store
- buttonsFormulario

```javascript
 <FormularioDinamico
      titulo="Insertar video"
      :camposFormulario="camposForm"
      :store="videosStore.new"
      :buttonsFormulario="buttonsFormulario"
    >
      <template #extra>
        <VideoUploader />
      </template>
    </FormularioDinamico>

// campos form
const camposForm = [
{
    campo_bbdd: "nombre",
    tipo: "text",
    placeholder: "Nombre",
  },
  {
    campo_bbdd: "descripcion",
    tipo: "text",
    placeholder: "Descripción",
  }
];

// store
// en este caso, al usar pinia, se llama a videosStore.new

// buttonsFormulario

// se pueden pasar actions que sean arrowFunction dentro del mismo componente, o se puede ejecutar directamente.
const buttonsFormulario = [
  { text: "Insertar vídeo", action: insertar },
  { text: "Cerrar", action: () => router.push("/admin/videos") },
];
```

Como se puede observar, hay un template en medio del form. se puede añadir como #extra un template ya que hay ```<slots>``` dentro.

## Roadmap

Here’s a glimpse into the exciting journey ahead for our project:

### Próximamente

- **2024 - general**: 
  - [Acabar readme.md]: Terminar toda la documentación.
  - [Repasar bugs y añadir funciones que faltan]: Revisar y testear.

- **2025**: 
  - [Añadir filtros en servidor]: Poder filtrar datos en servidor y mejorar la paginación.
  - [Añadir hoja de estilos default]: Se espera poder tener en 2025 un estilo homogéneo para toda la base web reutilizable.

We’re excited about what’s coming and will keep you updated as we progress. Your feedback and support are crucial as we build the future!

## Changelog

- **v1.0.0** (07-10-2024): Initial release.

## Contacto

Para cualquier duda:

- **Email**: [cvecinav@gmail.com]

Espero que sirva como introducción al template :)