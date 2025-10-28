# Changelog

## [2.0.0](https://github.com/jorge-maikel-sierra/factura-justa-api/compare/factura-justa-api-v1.0.0...factura-justa-api-v2.0.0) (2025-10-28)


### ⚠ BREAKING CHANGES

* **ci:** La plantilla ahora exige un formato XML y pasos guiados para la creación de todos los commits.
* **ci:** Ya no se asigna automáticamente a @jorge-maikel-sierra como revisor en todos los PRs.
* **deploy:** Se deja de usar Docker en el pipeline de despliegue y CI
* **deploy:** Se deja de usar Docker en el pipeline de despliegue y CI

### Features

* **db:** hash automático de contraseñas, factory y seeder de usuarios; endpoint GET /users con Lucid ([7d8baba](https://github.com/jorge-maikel-sierra/factura-justa-api/commit/7d8baba0568ee2feda6349aa130741d690c16250))
* **deploy:** preparar despliegue continuo en Fly.io con Docker y workflow\n\n- Dockerfile multi-stage para build y runtime en Node 20\n- .dockerignore para reducir contexto de build\n- fly.toml con servicio HTTP en puerto 8080 y healthcheck\n- Workflow de GitHub Actions que despliega a Fly en cada push a main\n\nDocs: se requiere secreto FLY_API_TOKEN y variables APP_KEY/DB_* en Fly ([a5db849](https://github.com/jorge-maikel-sierra/factura-justa-api/commit/a5db849c400d4185bd6610d7938b5d890868bc09))


### Bug Fixes

* **ci:** alinear fly.toml y workflow con buenas prácticas (healthcheck, autostop, release_command, app name) ([3942812](https://github.com/jorge-maikel-sierra/factura-justa-api/commit/3942812b07199bd84163c71a333b1308b47be34a))
* **deploy:** forzar uso de Dockerfile en Fly.io para evitar error de buildpacks (manifest.json) ([5d6fda9](https://github.com/jorge-maikel-sierra/factura-justa-api/commit/5d6fda953f206e7f05913e953910212808bbd6e3))
* **deploy:** incluir Dockerfile en build y forzar dockerfile en workflow para evitar error /tmp/manifest.json ([d4d9ced](https://github.com/jorge-maikel-sierra/factura-justa-api/commit/d4d9ced27990487f02c0ec4b628544265379562e))


### Documentation

* **ci:** actualizar plantilla de commit ([4c7401f](https://github.com/jorge-maikel-sierra/factura-justa-api/commit/4c7401fe41b41449cdf1bf74c3d001b8cc7c097f))


### Miscellaneous Chores

* **ci:** eliminar archivo CODEOWNERS ([78f1dce](https://github.com/jorge-maikel-sierra/factura-justa-api/commit/78f1dceb1a1463debbd86020cd9375b2ebdcacb0))


### Continuous Integration

* **deploy:** eliminar Docker y usar Nixpacks en Fly.io ([ce77466](https://github.com/jorge-maikel-sierra/factura-justa-api/commit/ce77466f1891de7c32816d64646b0315fe769f44))
* **deploy:** eliminar Docker y usar Nixpacks Fly.io ([f3de89f](https://github.com/jorge-maikel-sierra/factura-justa-api/commit/f3de89f52b099124acf04b4bfa6268e5def2456e))

## 1.0.0 (2025-10-27)


### Features

* **ci:** activar flujo de release con semantic-release ([44c9a5d](https://github.com/jorge-maikel-sierra/factura-justa-api/commit/44c9a5d92f48078265826fe7cfce7ad7552cf351))
