import { createRequire } from 'module'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const target = join(__dirname, '..', 'node_modules', '@lexical', 'react', 'dist', 'LexicalDecoratorBlockNode.dev.mjs')

const content = readFileSync(target, 'utf8')

const patched = content
  .replace(
    /import \{ DecoratorNode, \$getDocument \} from 'lexical';/,
    [
      "import { createRequire as ___createRequire } from 'module';",
      "const ___require = ___createRequire(import.meta.url);",
      "const { DecoratorNode, $getDocument } = ___require('lexical');",
    ].join('\n'),
  )

writeFileSync(target, patched, 'utf8')
console.log('Patched @lexical/react/LexicalDecoratorBlockNode.dev.mjs')