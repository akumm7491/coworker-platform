export class UpdateUserRolesCommand {
  constructor(
    public readonly userId: string,
    public readonly roles: string[]
  ) {}
}
