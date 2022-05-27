export interface Bindings {
  USERNAME: string
  PASSWORD: string
  YM_HCW: KVNamespace
}

declare global {
  function getMiniflareBindings(): Bindings
}