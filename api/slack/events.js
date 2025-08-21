import bolt from '@slack/bolt';
// TODO: Importar a lógica do create-project.js no futuro

const { App } = bolt;

// Inicializa o App com as credenciais do .env
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Ouve pelo comando /criar-projeto
app.command('/criar-projeto', async ({ ack, body, client, logger }) => {
  // Confirma o recebimento do comando
  await ack();

  try {
    // Abre o formulário (modal)
    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'create_project_view',
        title: {
          type: 'plain_text',
          text: 'Novo Projeto Synapse B2B'
        },
        blocks: [
          // Bloco para o nome do projeto
          {
            type: 'input',
            block_id: 'project_name_block',
            element: { type: 'plain_text_input', action_id: 'project_name_input' },
            label: { type: 'plain_text', text: 'Nome Completo do Projeto' }
          },
          // Bloco para o nome do repositório
          {
            type: 'input',
            block_id: 'repo_name_block',
            element: { type: 'plain_text_input', action_id: 'repo_name_input' },
            label: { type: 'plain_text', text: 'Nome do Repositório no GitHub' }
          }
          // Adicionar mais campos aqui (tipo, descrição, etc.)
        ],
        submit: {
          type: 'plain_text',
          text: 'Criar Projeto'
        }
      }
    });
  } catch (error) {
    logger.error(error);
  }
});

// Ouve pelo envio do formulário
app.view('create_project_view', async ({ ack, body, view, client, logger }) => {
  // Confirma o recebimento do envio
  await ack();

  const user = body.user.id;
  const projectName = view.state.values.project_name_block.project_name_input.value;
  const repoName = view.state.values.repo_name_block.repo_name_input.value;

  try {
    // Manda uma mensagem inicial para o usuário que iniciou o comando
    await client.chat.postMessage({
      channel: user,
      text: `Ok! Recebi o pedido para o projeto "${projectName}". Começando a mágica... 🧙‍♂️`
    });

    // =================================================================
    // AQUI DENTRO, VAMOS CHAMAR A LÓGICA DO NOSSO create-project.js
    // Por enquanto, é um placeholder.
    // =================================================================
    console.log(`Dados recebidos: ${projectName}, ${repoName}`);

  } catch (error) {
    logger.error(error);
  }
});

// Boilerplate para a Vercel Function
export default async (req, res) => {
  await app.start();
  await app.processEvent(req.body);
  res.status(200).send();
};