import yaml from 'js-yaml'
import { MapOfValues } from '..'

// eslint-disable-next-line @typescript-eslint/prefer-interface
type envValues = { path: string[]; value: MapOfValues }

/**
 * Read keys prefixed by `prefix` and load their values from the environment (or `source`) into an object.
 *
 * @param prefix The environment key prefix to filter for,
 * @param separator The separator character to use between the `prefix` and key paths themselves
 * @param source The source map to get values from
 */
export function env(prefix = 'BLINKCONFIG', separator = '.', source = process.env): MapOfValues {
  console.warn('Loading config overrides from the environment')

  return Object.keys(source)
    .filter((key): boolean => key.startsWith(prefix))
    .map(
      (key): envValues => ({
        path: key.replace(prefix + separator, '').split(separator),
        value: yaml.load(source[key] || ''),
      }),
    )
    .reduce((map: MapOfValues, { path, value }: envValues): MapOfValues => {
      let n = map
      for (let component of path.slice(0, -1)) {
        n[component] = n[component] || {}
        n = n[component]
      }
      n[path[path.length - 1]] = value
      return map
    }, {})
}
