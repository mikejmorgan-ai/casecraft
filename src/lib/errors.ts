/**
 * Copyright (c) 2026 AI Venture Holdings LLC
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

export class PaymentRequiredError extends Error {
  constructor(message = 'Payment required to access this feature') {
    super(message)
    this.name = 'PaymentRequiredError'
  }
}

export class OrganizationRequiredError extends Error {
  constructor(message = 'Organization context required for data access') {
    super(message)
    this.name = 'OrganizationRequiredError'
  }
}

export class InsufficientPermissionsError extends Error {
  constructor(message = 'Insufficient permissions to access this resource') {
    super(message)
    this.name = 'InsufficientPermissionsError'
  }
}

export class ValidationError extends Error {
  constructor(message = 'Validation failed') {
    super(message)
    this.name = 'ValidationError'
  }
}