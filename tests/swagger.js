const fs = require('fs');
const ts = require('typescript');

function generate(file, config = {}) {

  // init typescript
  const program = ts.createProgram([file], {});
  const typeChecker = program.getTypeChecker();

  // get the file
  const node = program.getSourceFile(file)
  if(node.kind === ts.SyntaxKind.ClassDeclaration) {
    for(const m of node.members) {
      if(m.kind === ts.SyntaxKind.MethodDeclaration) {

        // build params
        const parameters = this.node.parameters.map(p => {

        });
      }
    }
  }

  // define the spec
  const spec = {
    basePath: config.basePath,
    consumes: ['application/json'],
    // definitions: this.buildDefinitions(),
    info: {},
    // paths: this.buildPaths(),
    produces: ['application/json'],
    swagger: '2.0'
  };

  // write the file
  // fs.writeFile(`${config.outDir}/swagger.json`, JSON.stringify(spc, null, '\t'));
}

generate('./mock.ts');
