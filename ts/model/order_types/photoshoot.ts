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

    private constructor(date_time: string, type: PhotoshootType) {
        this.date_time = date_time;
        this.type = type;
    }

    public static parse(order_info: any): Photoshoot {
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
}