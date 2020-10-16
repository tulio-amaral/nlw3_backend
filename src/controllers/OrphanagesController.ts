import { Request, Response } from 'express'
import { getRepository } from 'typeorm';
import Orphange from '../models/Orphanage';
import ophanageView from '../views/orphanages_view';
import * as Yup from 'yup';

export default {
  async index(request: Request, response: Response) {
    const orphanagesRepository = getRepository(Orphange);

    const orphanages = await orphanagesRepository.find({
      relations: ['images']
    });

    return response.json(ophanageView.renderMany(orphanages));
  },

  async show(request: Request, response: Response) {
    const { id } = request.params;

    const orphanagesRepository = getRepository(Orphange);

    const orphanage = await orphanagesRepository.findOneOrFail(id, {
      relations: ['images']
    });

    return response.json(ophanageView.render(orphanage));
  },

  async create(request: Request, response: Response) {
    const {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends
    } = request.body;

    
    const orphanagesRepository = getRepository(Orphange);

    const requestImages = request.files as Express.Multer.File[];
    const images = requestImages.map(image => {
      return { path: image.filename }
    })
  
    const data = {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends,
      images 
    };

    const schema = Yup.object().shape({
      name: Yup.string().required('Nome obrigátorio'),
      latitude: Yup.number().required('Latitude obrigátoria'),
      longitude: Yup.number().required('Longitude obrigátoria'),
      about: Yup.string().required('Sobre obrigátorio e maximo de 300 letras')
      .max(300),
      instructions: Yup.string().required('Instruções obrigátorias'),
      opening_hours: Yup.string().required('Horário de abertura obrigátorio'),
      open_on_weekends: Yup.boolean().required('Disponibildade obrigátoria'),
      images: Yup.array(
        Yup.object().shape({
        path: Yup.string().required()
      }))
    })

    await schema.validate(data, { abortEarly: false})

    const orphanage = orphanagesRepository.create(data)
  
    await orphanagesRepository.save(orphanage);
  
    return response.status(201).json(orphanage)
  }
}