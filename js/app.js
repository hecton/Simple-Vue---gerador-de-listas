var app = new Vue({
    el: '#app',

    data: {
        nome: '',
        campo: '',
        campos: [],

        listaTabelas: [],
        tabelas: [],
        tabelaSelecionada: null,

        formTab: [],
        formTabSugestions: [],
        editKey: null,

        pesquisa: '',
        ordem: 0,
        desc: true,
    },

    created() {
        var data = localStorage.getItem('listaDeTabelas');
        if(data != null){
            data = JSON.parse(data);

            this.tabelas = data.tabelas;
            this.tabelaSelecionada = data.tabelaSelecionada;
            this.listaTabelas = data.tabelas.map(tab => tab.nome);
        }
    },

    watch: {
        tabelaSelecionada(){
            this.formTab = this.tabelas[this.tabelaSelecionada].header.map(data => '');
            this.ordem = 0;

            //pega os dados para as sugestões.
            this.formTabSugestions = this.formTab.map(i => []);
            this.tabelas[this.tabelaSelecionada].data.forEach(item => {
                item.forEach((val, key) => this.formTabSugestions[key].push(val));
            });

            this.formTabSugestions = this.formTabSugestions.map(val => [...new Set(val)]);
        }
    },

    computed: {
        listaFiltrada(){
            var pesquisa = this.pesquisa;
            var ordem = this.ordem;
            var desc = this.desc;
            var data = JSON.parse(JSON.stringify(this.tabelas[this.tabelaSelecionada].data));

            return data.filter((item, key) => {
                if(item.filter(val => val.toString().toLowerCase().match(RegExp(pesquisa))).length > 0){
                    item.unshift(key);
                    return item;
                }
            }).sort((a, b) => {
                if(a[ordem+1].toString().toLowerCase() < b[ordem+1].toString().toLowerCase())
                    return desc? -1 : 1;
                else
                    return desc? 1 : -1;
            });
        }
    },

    methods: {
        /**
         *  Adiciona campos na lista
         * @param campos 
         */
        addCampo(ops = true){
            if(ops && this.campo != '')
                ops = [this.campo];

            ops.forEach(op => this.campos.push(op));
            this.campo = '';
        },

        /**
         * Remove um campo.
         * @param  key 
         */
        removeCampo(key){
            this.campos.pop(key);
        },

        /**
         * Cria uma nova tabela
         */
        criarTabela(){
            // pega os calores
            var nome = this.nome;
            var header = this.campos;
            // limpa os campo
            this.nome = '';
            this.campo = '';
            this.campos = [];

            // cria a tabela.
            var tabela = {
                nome: nome,
                header: header,
                data: [],
            }

            // adiciona os dados.
            this.tabelas.push(tabela);
            this.listaTabelas.push(nome);
            this.tabelaSelecionada = this.tabelas.length-1;
            this.salvar();
        },

        /**
         * remove a tabela selecionada,
         */
        removeTabela(){
            var tabela  = this.tabelaSelecionada;
            this.tabelaSelecionada = null;
            this.listaTabelas.pop(tabela);
    
            this.tabelas.pop(tabela);
            this.salvar();
        },

        /**
         * Adiciona uma na tabela.
         */
        addItemTabela(){
            if(this.editKey != null)
                this.editItemTabela();
            else{
                this.tabelas[this.tabelaSelecionada].data.push(this.formTab);
                this.AtualizaSugestao(this.formTab);

                this.formTab = this.tabelas[this.tabelaSelecionada].header.map(data => '');
                this.salvar();
            }

        },

        /**
         * Atualiza a sugestções com os novos valores adicionados.
         * @param data 
         */
        AtualizaSugestao(data){
            data.forEach((item, key) => {
                if(!this.formTabSugestions[key].includes(item)){
                    this.formTabSugestions[key].push(item);
                }
            });
        },

        /**
         * Remove um item da tabela selecionada.
         * @param key 
         */
        removeItemTabela(key){
            this.tabelas[this.tabelaSelecionada].data.pop(key);
            this.salvar();
        },

        /**
         * Seleciona o item para edição.
         */
        SelectEditItemTabela(key){
            this.editKey = key;
            this.formTab = [...this.tabelas[this.tabelaSelecionada].data[this.editKey]];
        },

        /**
         * Ediata um item na tabela.
         * @param key 
         */
        editItemTabela(){
            if(this.editKey != null){
                this.$set(this.tabelas[this.tabelaSelecionada].data, this.editKey, this.formTab);
                this.AtualizaSugestao(this.formTab);
                this.editKey = null;
                this.formTab = this.tabelas[this.tabelaSelecionada].header.map(coluna => '');
                this.salvar();
            }
        },

        /**
         * Cancela a edição.
         */
        cancelarEdicao(){
            this.editKey = null;
            this.formTab.map(item => '');
        },

        /**
         * salva os dados.
         */
        salvar(){
            localStorage.setItem('listaDeTabelasBackup', localStorage.getItem('listaDeTabelas'));

            localStorage.setItem('listaDeTabelas', JSON.stringify({
                tabelas: this.tabelas,
                tabelaSelecionada: this.tabelaSelecionada
            }));

        },

        /**
         * Volta ao estado anterior
         * @param key 
         */
        Backup(){
            var data = localStorage.getItem('listaDeTabelasBackup');
            if(data != null){
                data = JSON.parse(data);

                this.tabelas = data.tabelas;
                this.tabelaSelecionada = data.tabelaSelecionada;
                this.listaTabelas = data.tabelas.map(tab => tab.nome);

                this.salvar();
            }
        },

        /**
         * Altera a ordenação.
         * @param  key 
         */
        ordena(key){
            if(this.ordem == key)
                this.desc = !this.desc;
            else{
                this.ordem = key;
                this.desc = true;
            }
        }
    },
});



