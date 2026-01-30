type UserActionResult =
  | { success: true; message?: string }
  | { success: false; error: string }
