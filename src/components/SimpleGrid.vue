<template>
    <table>
    <caption v-if="caption">{{ caption }}</caption>
    <thead>
        <tr>
        <th v-for="(header, index) in headers"
            @click="sortBy(key)"
            :class="{ active: sortKey == header.name }"
            :key="index">
            {{ header.title | capitalize }}
            <span class="arrow" :class="sortOrders[header.name] > 0 ? 'asc' : 'dsc'">
            </span>
        </th>
        </tr>
    </thead>
    <tbody>
        <tr v-for="(entry, row) in filteredData" :key="row">
            <td v-for="(header, col) in headers" :key="col">{{ entry[header.name] | formatEntry(header.filter, $options.filters) }}</td>
        </tr>
    </tbody>
    </table>
</template>

<script>
export default {
    data() {
        var sortOrders = {};
        var headers = [];
        for (var h of this.columns) {
            if (typeof h == 'string' || h instanceof String) {
                headers.push({name: h, title: h});
            } else {
                var value = h;
                if (!value.title && value.name) {
                    value = {title: value.name, ...value};
                }
                headers.push(value);
            }
        }
        headers.forEach(function(h) {
            sortOrders[h.name] = 1;
        });
        return {
            sortKey: "",
            sortOrders,
            headers
        };
    },
    props: {
        columns: Array,
        data: Array,
        filterKey: String,
        caption: String
    },
    computed: {
        filteredData: function() {
            var sortKey = this.sortKey;
            var filterKey = this.filterKey && this.filterKey.toLowerCase();
            var order = this.sortOrders[sortKey] || 1;
            var result = this.data;
            if (filterKey) {
                result = result.filter(function(row) {
                    return Object.keys(row).some(function(key) {
                        return (
                            String(row[key])
                                .toLowerCase()
                                .indexOf(filterKey) > -1
                        );
                    });
                });
            }
            if (sortKey) {
                result = result.slice().sort(function(a, b) {
                    a = a[sortKey];
                    b = b[sortKey];
                    return (a === b ? 0 : a > b ? 1 : -1) * order;
                });
            }
            return result;
        }
    },
    filters: {
        capitalize: function(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        },
        formatEntry: function(value, filter, filters) {
            if (filter) {
                var func = filters[filter];
                if (func) {
                    return func(value)
                }
            }
            return value;
        }
    },
    methods: {
        sortBy: function(key) {
            this.sortKey = key;
            this.sortOrders[key] = this.sortOrders[key] * -1;
        }
    }
}
</script>

<style scoped>
table {
  border: 2px solid #42b983;
  border-radius: 3px;
  background-color: #fff;
}

th {
  background-color: #42b983;
  color: rgba(255, 255, 255, 0.66);
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

td {
  background-color: #f9f9f9;
}

th,
td {
  min-width: 5em;
  padding: 0.5em 1em;
}

th.active {
  color: #fff;
}

th.active .arrow {
  opacity: 1;
}

.arrow {
  display: inline-block;
  vertical-align: middle;
  width: 0;
  height: 0;
  margin-left: 5px;
  opacity: 0.66;
}

.arrow.asc {
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-bottom: 4px solid #fff;
}

.arrow.dsc {
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid #fff;
}

caption {
  font-size: larger;
  font-weight: bold;
  background-color: #f9f9f9;
}
</style>