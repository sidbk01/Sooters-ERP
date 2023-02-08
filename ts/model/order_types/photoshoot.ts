import { AjaxParser, DateDisplayField, DateInput, DisplayField, FormInput, SelectDisplayField, SelectInput, SelectOption, ajax } from "../../framework/index";
import { OrderTypeInfo } from "./type";

enum PhotoshootTypeInner {
    FamilySession = 1,
    ClassicCollection,
    LocationSession,
    BusinessHeadshot,
    StandardGraduationPhoto,
    LifestyleGraduation,
}

class PhotoshootType implements SelectOption {
    private type: PhotoshootTypeInner;

    public static parse(type: number): PhotoshootType {
        if (type < 1 || type > 6 || type % 1 != 0)
            throw `Unknown photoshoot type "${type}"`;

        return new PhotoshootType(type as PhotoshootTypeInner);
    }

    public static get(): PhotoshootType[] {
        return [
            new PhotoshootType(PhotoshootTypeInner.FamilySession),
            new PhotoshootType(PhotoshootTypeInner.ClassicCollection),
            new PhotoshootType(PhotoshootTypeInner.LocationSession),
            new PhotoshootType(PhotoshootTypeInner.BusinessHeadshot),
            new PhotoshootType(PhotoshootTypeInner.StandardGraduationPhoto),
            new PhotoshootType(PhotoshootTypeInner.LifestyleGraduation),
        ];
    }

    private constructor(type: PhotoshootTypeInner) {
        this.type = type;
    }

    public get_select_text(): string {
        switch (this.type) {
            case PhotoshootTypeInner.FamilySession:
                return "Family Session";

            case PhotoshootTypeInner.ClassicCollection:
                return "Classic Collection";

            case PhotoshootTypeInner.LocationSession:
                return "Location Session";

            case PhotoshootTypeInner.BusinessHeadshot:
                return "Business Headshot";

            case PhotoshootTypeInner.StandardGraduationPhoto:
                return "Standard Graduation Photo";

            case PhotoshootTypeInner.LifestyleGraduation:
                return "Lifestyle Graduation";
        }
    }

    public get_select_value(): number {
        return this.type as number;
    }
}

export class Photoshoot implements OrderTypeInfo {
    private date_time: string;
    private type: PhotoshootType;

    public static parse(order_info: any): Photoshoot {
        if (typeof order_info === "undefined")
            return;

        return new Photoshoot(order_info.date_time, PhotoshootType.parse(order_info.type));
    }

    public static get_group_inputs(): [string, FormInput][] {
        return [
            ["photoshoot_type", new SelectInput("Photoshoot Type", PhotoshootType.get())],
            ["date_time", new DateInput("Scheduled Date & Time", "A date and time is required", true)],
        ];
    }

    public static async get_info(id: number): Promise<OrderTypeInfo> {
        return ajax("GET", `/orders/photoshoot?id=${id}`, new PhotoshootParser());
    }

    public constructor(date_time: string, type: PhotoshootType) {
        this.date_time = date_time;
        this.type = type;
    }

    public get_display_fields(): DisplayField[] {
        return [
            new DisplayField("order_info_date_time", "Scheduled Date & Time", new DateDisplayField(this.date_time, "A scheduled time is required", true)),
            new DisplayField("order_info_photoshoot_type", "Photoshoot Type", new SelectDisplayField(PhotoshootType.get(), this.type.get_select_value()))
        ];
    }
}

class PhotoshootParser implements AjaxParser<Photoshoot> {
    public constructor() { }

    public async parse_object(object: any): Promise<Photoshoot> {
        return new Photoshoot(object.date_time, PhotoshootType.parse(object.photoshoot_type));
    }
}