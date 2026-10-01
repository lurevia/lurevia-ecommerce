import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import {
    sendSuccess,
    sendCreated,
    sendNoContent,
} from "../../../utils/apiResponse";
import {
    addressesService,
    type AddressesService,
} from "../services/addresses.service";
import { addressMapper } from "../mapper/addresses.mapper";

export class AddressesController {
    constructor(private readonly service: AddressesService) { }

    list = asyncHandler(async (req: Request, res: Response) => {
        const addresses = await this.service.list(req.user!.id);
        sendSuccess(res, {
            addresses: addressMapper.toOutputList(addresses),
        });
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const address = await this.service.getById(req.user!.id, req.params.id);
        sendSuccess(res, { address: addressMapper.toOutput(address) });
    });

    create = asyncHandler(async (req: Request, res: Response) => {
        const address = await this.service.create(req.user!.id, req.body);
        sendCreated(res, { address: addressMapper.toOutput(address) });
    });

    update = asyncHandler(async (req: Request, res: Response) => {
        const address = await this.service.update(
            req.user!.id,
            req.params.id,
            req.body
        );
        sendSuccess(res, { address: addressMapper.toOutput(address) });
    });

    remove = asyncHandler(async (req: Request, res: Response) => {
        await this.service.remove(req.user!.id, req.params.id);
        sendNoContent(res);
    });

    setDefault = asyncHandler(async (req: Request, res: Response) => {
        const address = await this.service.setDefault(req.user!.id, req.params.id);
        sendSuccess(res, { address: addressMapper.toOutput(address) });
    });
}

export const addressesController = new AddressesController(addressesService);