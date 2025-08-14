import { Layout } from "./style";
import { VacuumSceneModel } from "./VacuumSceneModel";
import React from "react";

type VacuumComponentProps = {
    model?: VacuumSceneModel;
    children?: React.ReactNode;
};

export function VacuumComponent(props: VacuumComponentProps) {
    return (
        <div>
            <Layout>
                <div className={"container-fluid"}>
                    <div className={"row"}>
                        {props.children}
                    </div>
                </div>
            </Layout>
        </div>
    );
}