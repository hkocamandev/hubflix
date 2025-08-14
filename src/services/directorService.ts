import Director from "../models/Director";

export const createDirector = async (payload: {
  firstName: string; secondName: string; birthDate: string | Date; bio?: string;
}) => {
  return Director.create({
    ...payload,
    birthDate: new Date(payload.birthDate)
  });
};

export const deleteDirector = async (id: string) => {
  return Director.findByIdAndDelete(id);
};