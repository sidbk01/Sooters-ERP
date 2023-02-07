import { AjaxParser, DateInput, FormInput, SelectInput, SelectOption, ajax } from "../../framework/index";
import { OrderTypeInfo } from "./type";

export enum PhotoshootType {
    FamilySession = 1,
    ClassicCollection,
    LocationSession,
    BusinessHeadshot,
    StandardGraduationPhoto,
    LifestyleGraduation,
}

export class Photoshoot implements OrderTypeInfo {
    private date_time: string;
    private type: PhotoshootType;

    public static parse(order_info: any): Photoshoot {
        if (typeof order_info === "undefined")
            return;

        let type;
        switch (order_info.type) {
            case 1:
                type = PhotoshootType.FamilySession;
                break;

            case 2:
                type = PhotoshootType.ClassicCollection;
                break;

            case 3:
                type = PhotoshootType.LocationSession;
                break;

            case 4:
                type = PhotoshootType.BusinessHeadshot;
                break;

            case 5:
                type = PhotoshootType.StandardGraduationPhoto;
                break;

            case 6:
                type = PhotoshootType.LifestyleGraduation;
                break;

            default:
                throw `Unknown photoshoot type "${order_info.type}"`;
        }

        return new Photoshoot(order_info.date_time, type);
    }

    public static get_group_inputs(): [string, FormInput][] {
        return [
            ["type", new SelectInput("Photoshoot Type", PhotoshootTypeOption.get())],
            ["datetime", new DateInput("Scheduled Date & Time", "A date and time is required", true)],
        ];
    }

    public static async get_info(id: number): Promise<OrderTypeInfo> {
        return ajax("GET", `/orders/photoshoot?id=${id}`, new PhotoshootParser());
    }

    public constructor(date_time: string, type: PhotoshootType) {
        this.date_time = date_time;
        this.type = type;
    }
}

class PhotoshootTypeOption implements SelectOption {
    private type: PhotoshootType;

    public static get(): PhotoshootTypeOption[] {
        return [
            new PhotoshootTypeOption(PhotoshootType.FamilySession),
            new PhotoshootTypeOption(PhotoshootType.ClassicCollection),
            new PhotoshootTypeOption(PhotoshootType.LocationSession),
            new PhotoshootTypeOption(PhotoshootType.BusinessHeadshot),
            new PhotoshootTypeOption(PhotoshootType.StandardGraduationPhoto),
            new PhotoshootTypeOption(PhotoshootType.LifestyleGraduation),
        ];
    }

    private constructor(type: PhotoshootType) {
        this.type = type;
    }

    public get_select_text(): string {
        switch (this.type) {
            case PhotoshootType.FamilySession:
                return "Family Session";

            case PhotoshootType.ClassicCollection:
                return "Classic Collection";

            case PhotoshootType.LocationSession:
                return "Location Session";

            case PhotoshootType.BusinessHeadshot:
                return "Business Headshot";

            case PhotoshootType.StandardGraduationPhoto:
                return "Standard Graduation Photo";

            case PhotoshootType.LifestyleGraduation:
                return "Lifestyle Graduation";
        }
    }

    public get_select_value(): number {
        return this.type as number;
    }
}

class PhotoshootParser implements AjaxParser<Photoshoot> {
    public constructor() { }

    public async parse_object(object: any): Promise<Photoshoot> {
        return new Photoshoot(object.date_time, object.photoshoot_type);
    }
}