import { v4 as uuidv4 } from 'uuid' //Inserção de imagem --> Cada uma é única
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext' //Todas informações da requisição
import Moment from 'App/Models/Moment'
import Application from "@ioc:Adonis/Core/Application" //A imagem fica no servidor e depois para aplicação

export default class MomentsController {
    private validationOptions = {
        types: ['image'],
        size: '2mb',
    }

    public async store({request, response}: HttpContextContract){
        const body = request.body()
        const image = request.file('image', this.validationOptions)
        //Se a imagem tiver vido
        if(image){
            const imageName =  `${uuidv4()}.${image.extname}` //Formato do nome do arquivo
            await image.move(Application.tmpPath('uploads'),{
                name: imageName
            })
            body.image = imageName
        }
        const moment = await Moment.create(body) //operação assicrona = await para esperar a inserção
        response.status(201) //Respost 
        return{
            message: 'Momento criado com sucesso',
            data: moment,
        }
    }
    //Exibir, trazer e mostrar oq ue tem armazenado
    public async index() {
        const moments = await Moment.query().preload('comments')

        return{
            data: moments,
        }
    }
    //Exibir apenas 1 
    public async show({params}: HttpContextContract){
        const moment = await Moment.findOrFail(params.id)

        await moment.load('comments')

        return{
            data: moment,
        }
    }

    //Deletar
    public async destroy({params}: HttpContextContract){
        const moment = await Moment.findOrFail(params.id)

        await moment.delete() //Exclui da tabela

        return{
            message: 'Momento excluído com sucesso!',
            data: moment,
        }
    }

    //
    public async update({params, request}: HttpContextContract){
        const body = request.body()

        const moment = await Moment.findOrFail(params.id)

        moment.title = body.title
        moment.description = body.description

        if(moment.image != body.image || !moment.image){
            const image = request.file('image', this.validationOptions)

            if(image){
                const imageName =  `${uuidv4()}.${image.extname}` //Formato do nome do arquivo
                await image.move(Application.tmpPath('uploads'),{
                    name: imageName
                })
                moment.image = imageName
            }
        }
        await moment.save() //metodo de atualização
        
        return{
            message: 'Momento atualizado com sucesso',
            data: moment,
        }
    }
}
