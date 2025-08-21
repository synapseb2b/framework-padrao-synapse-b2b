import bolt from '@slack/bolt';
import { generateProject } from '../../lib/project-generator.js';

const { App } = bolt;

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  processBeforeResponse: true, // Importante para Vercel
});

// Ouve pelo comando /criar-projeto
app.command('/criar-projeto', async ({ ack, body, client, logger }) => {
  await ack();
  try {
    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'create_project_view',
        title: { type: 'plain_text', text: 'Novo Projeto Synapse B2B' },
        blocks: [
          {
            type: 'input',
            block_id: 'project_name_block',
            element: { type: 'plain_text_input', action_id: 'project_name_input' },
            label: { type: 'plain_text', text: 'Nome Completo do Projeto' }
          },
          {
            type: 'input',
            block_id: 'repo_name_block',
            element: { type: 'plain_text_input', action_id: 'repo_name_input' },
            label: { type: 'plain_text', text: 'Nome do Repositório no GitHub' }
          }
        ],
        submit: { type: 'plain_text', text: 'Criar Projeto' }
      }
    });
  } catch (error) {
    logger.error(error);
  }
});

// Ouve pelo envio do formulário
app.view('create_project_view', async ({ ack, body, view, client, logger }) => {
  await ack({
    response_action: 'update',
    view: {
      type: 'modal',
      title: { type: 'plain_text', text: 'Processando...' },
      blocks: [
        {
          type: 'section',
          text: { type: 'mrkdwn', text: 'Recebi seu pedido! Um momento enquanto eu preparo tudo... 🧙‍♂️' }
        }
      ]
    }
  });

  const user = body.user.id;
  const projectName = view.state.values.project_name_block.project_name_input.value;
  const repoName = view.state.values.repo_name_block.repo_name_input.value;
  const projectType = 'client'; // Assumindo cliente, como antes
  const description = `Projeto: ${projectName}`;

  try {
    // AQUI A MÁGICA ACONTECE!
    await generateProject({ projectType, projectName, repoName, description });
    
    await client.chat.postMessage({
      channel: user,
      text: `🎉 Pronto! O projeto "${projectName}" foi criado com sucesso!`
    });

  } catch (error) {
    logger.error(error);
    await client.chat.postMessage({
      channel: user,
      text: `❌ Opa, algo deu errado na criação do projeto "${projectName}": ${error.message}`
    });
  }
});


// ESTA É A PARTE QUE FALTAVA - O EXPORT PARA A VERCEL
const handler = async (req, res) => {
  await app.start();
  return await app.handle(req, res);
};

export default handler;