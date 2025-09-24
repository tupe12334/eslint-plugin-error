/**
 * @fileoverview ESLint Plugin for Error Handling Best Practices
 * @description A comprehensive ESLint plugin that enforces best practices for JavaScript
 * and TypeScript error handling. This plugin provides rules to encourage the use of
 * custom error classes, prevent generic error usage, and ensure proper error throwing patterns.
 *
 * @author ESLint Plugin Error Contributors
 * @version 1.0.0
 */

import { noGenericError } from './rules/no-generic-error/index.js';
import { requireCustomError } from './rules/require-custom-error/index.js';
import { noThrowLiteral } from './rules/no-throw-literal/index.js';

/**
 * ESLint Plugin Configuration Object
 * @type {Object}
 */
const plugin = {
  /**
   * Plugin metadata
   * @type {Object}
   */
  meta: {
    name: 'eslint-plugin-error',
    version: '1.0.0',
  },

  /**
   * Available rules in this plugin
   * @type {Object.<string, Object>}
   */
  rules: {
    /**
     * Disallows throwing generic Error instances and suggests custom error types
     * @type {Object}
     */
    'no-generic-error': noGenericError,

    /**
     * Requires custom error classes that extend Error with proper naming conventions
     * @type {Object}
     */
    'require-custom-error': requireCustomError,

    /**
     * Disallows throwing literals, primitives, or non-error objects as exceptions
     * @type {Object}
     */
    'no-throw-literal': noThrowLiteral,
  },

  /**
   * Pre-configured rule sets for common use cases
   * @type {Object.<string, Object>}
   */
  configs: {
    /**
     * Recommended configuration for most projects
     * Enables all rules with sensible defaults
     * @type {Object}
     */
    recommended: {
      plugins: {
        error: plugin,
      },
      rules: {
        'error/no-generic-error': 'error',
        'error/require-custom-error': 'error',
        'error/no-throw-literal': 'error',
      },
    },

    /**
     * Strict configuration for projects requiring enhanced error handling
     * Same as recommended but with stricter enforcement
     * @type {Object}
     */
    strict: {
      plugins: {
        error: plugin,
      },
      rules: {
        'error/no-generic-error': 'error',
        'error/require-custom-error': 'error',
        'error/no-throw-literal': 'error',
      },
    },
  },
};

export default plugin;