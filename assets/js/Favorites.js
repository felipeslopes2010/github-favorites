import { GithubUser } from "./GithubUser.js";

// Classe que vai conter a lógica dos dados
// Como os dados serão tratados
export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root);
        this.load();
    }

    load() {
        this.entries = JSON.parse(localStorage.getItem('@github-favorites')) || [];
    }

    async add(username) {
        try {

            const userExists = this.entries.find(entry => entry.login === username);

            if (userExists) {
                throw new Error('Usuário já cadastrado!');
            }

            const user = await GithubUser.search(username);

            if(user.login === undefined) {
                throw new Error('Usuário não encontrado!');
            }

            this.entries = [user, ...this.entries];

            this.update();

            this.save();
            
        } catch(err) {
            alert(err.message);
        }
    }

    save() {
        localStorage.setItem('@github-favorites', JSON.stringify(this.entries));
    }

    delete(user) {
        const filteredEntries = this.entries.filter(entry  => {
            return entry.login !== user.login;
        });

        this.entries = filteredEntries;

        this.update();

        this.save();
    }
}

// Classe que vai criar a visualização e eventos do HTML
export class FavoritesView extends Favorites {
    constructor(root) {
        super(root);

        this.tbody = this.root.querySelector('table tbody');

        this.update();

        this.onAdd();
    }

    update() {
        this.removeAllTr();

        this.entries.forEach(user => {
            const row = this.createRow();

            row.querySelector('.user-photo img').src = `https://www.github.com/${user.login}.png`;
            row.querySelector('.user-photo img').alt = `Imagem de Perfil do usuário ${user.name}`;
            row.querySelector('.user-information a').href = `https://www.github.com/${user.login}`;
            row.querySelector('.username').textContent = `${user.name}`;
            row.querySelector('.user-login').textContent = `${user.login}`;
            row.querySelector('.public-repos').textContent = `${user.public_repos}`;
            row.querySelector('.followers').textContent = `${user.followers}`;

            row.querySelector('.remove').onclick = () => {
                const isOk = confirm('Tem certeza que deseja deletar essa linha?');

                if (isOk) {
                    this.delete(user);
                }
            };

            this.tbody.append(row);
        });
    }

    removeAllTr() {
        this.tbody.querySelectorAll('tr').forEach(tr => {
            tr.remove();
        });
    }

    createRow() {
        const tr = document.createElement('tr');

        tr.innerHTML = `
        <td class="user">
            <div class="user-photo">
                <img src="./assets/imgs/user-icon.png" alt="Imagem de perfil de usuário">
            </div>
            <div class="user-information">
                <a href="https://www.github.com/maykbrito" target="_blank">
                    <p class="username">Mayk Brito</p>
                    <span class="user-login">/maykbritto</span>
                </a>
            </div>
        </td>
        <td class="public-repos">
            123
        </td>
        <td class="followers">
            1234
        </td>
        <td>
            <button class="remove">Remover</button>
        </td>
    `
        return tr;
    }

    onAdd() {
        const addButton = document.querySelector('.search button');

        addButton.onclick = () => {
            const { value } = document.querySelector('.search input');
            this.add(value)
        };
    }
}