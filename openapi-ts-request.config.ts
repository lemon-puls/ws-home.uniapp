import type { GenerateServiceProps } from 'openapi-ts-request'

export default [
  {
    schemaPath: 'http://localhost:8080/swagger/doc.json',
    serversPath: './src/api',
    requestLibPath: `import request from '@/utils/request'`,
    requestOptionsType: 'RequestOptions',
    isGenReactQuery: true,
    reactQueryMode: 'vue',
    isGenJavaScript: false,
  },
] as GenerateServiceProps[]
