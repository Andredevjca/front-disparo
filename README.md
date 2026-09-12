# Frontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.27.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Configuração da API após o build

O endereço da API fica no arquivo `config.json`, copiado para a raiz do build (`dist/frontend/browser/config.json`). Edite esse arquivo depois do build e antes de publicar no IIS:

```json
{
	"apiUrl": "https://seu-servidor-api.exemplo.com"
}
```

Deixe `apiUrl` vazio para usar a mesma origem do frontend, por exemplo durante o desenvolvimento com o proxy local. Não é necessário gerar o build novamente ao trocar apenas esse arquivo.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
