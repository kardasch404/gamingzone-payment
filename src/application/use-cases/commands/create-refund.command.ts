export class CreateRefundCommand {
  constructor(
    public readonly paymentId: string,
    public readonly amount?: number,
    public readonly reason?: string,
    public readonly initiatedBy?: string,
  ) {}
}
