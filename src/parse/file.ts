import fs from 'fs'
import { extname } from 'path'
import { safeLoad } from 'js-yaml'
import { MapOfValues } from '..'

const yamlLoader = (path: string): MapOfValues => safeLoad(fs.readFileSync(path, 'utf8'))

const loaders = {
  json: require,
  yaml: yamlLoader,
  yml: yamlLoader,
}

function validProvider(name: string): name is keyof typeof loaders {
  return Object.keys(loaders).includes(name)
}

/**
 * Parse a file as YAML or JSON
 *
 * @param path The pathname to the file we want to load
 * @param format The format to interpet this file as
 */
export function file(path: string, format: string = 'yaml'): MapOfValues {
  if (!fs.existsSync(path)) {
    throw new Error(`Could not read configuration file at path: ${path}`)
  }

  if (format == '') {
    let extension = extname(path).replace('.', '')
    if (extension == '') {
      console.warn(`Unknown extension, parsing config file ${path} as YAML`)
      format = 'yaml'
    } else {
      format = extension
    }
  }

  if (!validProvider(format)) {
    throw new Error(`Unknown format: <${format}>`)
  }

  const parser = loaders[format]
  return parser(path)
}
