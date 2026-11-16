declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<Record<PropertyKey, never>, Record<PropertyKey, never>, unknown>;
  export default component;
}
