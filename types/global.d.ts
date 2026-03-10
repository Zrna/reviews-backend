declare module 'swagger-autogen' {
  interface SwaggerAutogenOptions {
    openapi?: string;
  }

  interface SwaggerAutogenResult {
    success: boolean;
    data: Record<string, unknown>;
  }

  function swaggerAutogen(
    options?: SwaggerAutogenOptions
  ): (
    outputFile: string,
    endpointsFiles: string[],
    doc: Record<string, unknown>,
    options?: Record<string, unknown>
  ) => Promise<SwaggerAutogenResult>;

  export = swaggerAutogen;
}
