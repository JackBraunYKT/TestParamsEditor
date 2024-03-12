import axios from "axios";
import React from "react";

const API_URL: string = "http://localhost:3001";

interface Param {
  id: number;
  name: string;
  type: "string";
}

interface ParamValue {
  paramId: number;
  value: string | number | (string | number)[];
}

interface Model {
  paramValues: ParamValue[];
}

interface Props {
  params: Param[];
  model: Model;
}

export default function App() {
  const [params, setParams] = React.useState<Param[]>([]);
  const [model, setModel] = React.useState<Model>({
    paramValues: [],
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const paramsEditorRef = React.useRef<ParamsEditor>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [modelRes, paramsRes] = await axios.all([
          axios.get(`${API_URL}/model`),
          axios.get(`${API_URL}/params`),
        ]);
        setParams(paramsRes.data);
        setModel(modelRes.data);
      } catch (error) {
        console.error(error);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleClick = () => {
    console.log(paramsEditorRef.current?.getModel());
  };

  return isLoading ? (
    <h2>Идет загрузка</h2>
  ) : (
    <>
      <ParamsEditor ref={paramsEditorRef} params={params} model={model} />
      <button onClick={handleClick}>Вывести Model в консоль</button>
    </>
  );
}

type TInputValues<T> = {
  [key: number]: T;
};

interface State {
  values: TInputValues<string | number | (string | number)[]>;
}

class ParamsEditor extends React.Component<Props, State> {
  private initialValues: TInputValues<string | number | (string | number)[]>;
  private paramsMap: Map<number, string>;

  constructor(props: Props) {
    super(props);

    this.state = {
      values: {},
    };

    this.initialValues = {};
    this.paramsMap = new Map();
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount(): void {
    this.props.params.forEach((param) =>
      this.paramsMap.set(Number(param.id), param.name)
    );

    this.props.model.paramValues.forEach((param) => {
      this.initialValues[param.paramId] = param.value;
    });

    this.setState({
      values: this.initialValues,
    });
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    this.setState((prevState) => ({
      values: {
        ...prevState.values,
        [name]: value,
      },
    }));
  };

  public getModel(): Model {
    const updatedModel: Model = {
      paramValues: [],
    };

    for (const [id, value] of Object.entries(this.state.values)) {
      updatedModel.paramValues.push({
        paramId: Number(id),
        value,
      });
    }

    return updatedModel;
  }

  renderInput = (
    paramId: number,
    value: string | number | (string | number)[]
  ) => {
    if (Array.isArray(value)) {
      return value.map((itemValue, index) => (
        <input
          key={index}
          type="text"
          name={`${paramId}-${index}`}
          value={itemValue || ""}
          onChange={this.handleChange}
        />
      ));
    } else {
      return (
        <input
          type={typeof value === "number" ? "number" : "text"}
          name={paramId.toString()}
          value={value || ""}
          onChange={this.handleChange}
        />
      );
    }
  };

  render() {
    console.log(this.props);
    return (
      <form>
        <table>
          <tbody>
            {this.props.model.paramValues.map((item) => (
              <tr key={item.paramId}>
                <th>{this.paramsMap.get(item.paramId)}</th>
                <td>
                  {this.renderInput(
                    item.paramId,
                    this.state.values[item.paramId]
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </form>
    );
  }
}
