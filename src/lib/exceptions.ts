export class APIError extends Error {
  public status;
  constructor(message: string | undefined, status: number) {
    super(message);
    this.status = status;
  }
}
export class InvalidRequestError extends APIError {
  constructor(message: string | undefined) {
    super(message, 400);
  }
}

export class Unauthorized extends APIError {
  constructor() {
    super("Unauthorized", 403);
  }
}

export class UserAlreadyExistError extends APIError {
  constructor() {
    super("User already exists", 400);
  }
}

export class CodeAlreadyRedeemed extends APIError {
  constructor() {
    super("Code already redeemed", 400);
  }
}
